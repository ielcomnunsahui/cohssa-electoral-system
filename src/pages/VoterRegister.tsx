import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Mail, AlertCircle, Fingerprint, CheckCircle, User, IdCard, Shield, Loader2, Check, Smartphone, HelpCircle, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { DualLogo } from "@/components/NavLink";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { showFriendlyError, showSuccessToast, showInfoToast } from "@/lib/errorMessages";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

// Strict matric validation regex: XX/XXaaa000 (e.g., 21/08nus014)
const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

const registrationSchema = z.object({
  matric: z
    .string()
    .min(1, "Matric number is required")
    .regex(MATRIC_REGEX, "Invalid matric format. Use: XX/XXaaa000 (e.g., 21/08nus014)"),
  email: z.string().email("Invalid email address"),
});

type Step = 'consent' | 'matric' | 'email' | 'verify_choice' | 'biometric' | 'otp' | 'success';

const steps = [
  { id: 'consent', label: 'Consent', icon: FileText },
  { id: 'matric', label: 'Matric', icon: IdCard },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'verify_choice', label: 'Verify', icon: Shield },
  { id: 'success', label: 'Done', icon: CheckCircle },
];

const VoterRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('consent');
  const [consentChecks, setConsentChecks] = useState({
    dataCollection: false,
    dataStorage: false,
    termsConditions: false,
  });
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [matricError, setMatricError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ matric: string; name: string; department: string; level: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [biometricSetupDone, setBiometricSetupDone] = useState(false);
  
  const { isSupported, isLoading: webAuthnLoading, checkSupport, registerCredential, saveCredential } = useWebAuthn();

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  const getStepIndex = (step: Step) => {
    if (step === 'biometric' || step === 'otp') return 3;
    if (step === 'consent') return 0;
    const idx = steps.findIndex(s => s.id === step);
    return idx === -1 ? steps.length : idx;
  };

  const allConsentsChecked = consentChecks.dataCollection && consentChecks.dataStorage && consentChecks.termsConditions;

  const handleConsentSubmit = () => {
    if (!allConsentsChecked) {
      toast.error("Please accept all consent items to continue");
      return;
    }
    setCurrentStep('matric');
  };

  const progress = ((getStepIndex(currentStep) + 1) / steps.length) * 100;

  const validateMatricFormat = (value: string) => {
    if (!value) {
      setMatricError(null);
      return;
    }
    if (!MATRIC_REGEX.test(value)) {
      setMatricError("Invalid format. Use: XX/XXaaa000 (e.g., 21/08NUS014)");
    } else {
      setMatricError(null);
    }
  };

  const handleMatricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!MATRIC_REGEX.test(matric)) {
      toast.error("Please enter a valid matric number");
      return;
    }
    
    setLoading(true);
    const inputMatric = matric.trim();

    try {
      // Check if matric already registered (case-insensitive using ILIKE)
      const { data: existingProfile } = await supabase
        .from("voters")
        .select("id")
        .ilike("matric_number", inputMatric)
        .maybeSingle();

      if (existingProfile) {
        toast.error("This matric number is already registered. Please login instead.");
        setLoading(false);
        return;
      }

      // Verify matric exists in student list (case-insensitive using ILIKE)
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .ilike("matric_number", inputMatric)
        .maybeSingle();

      if (studentError) {
        console.error("Student lookup error:", studentError);
        toast.error("Error checking student list. Please try again.");
        setLoading(false);
        return;
      }

      if (!student) {
        toast.error("Matric number not found in our records. Please ensure you're using the correct format or contact the electoral committee.");
        setLoading(false);
        return;
      }

      setStudentInfo({ 
        matric: student.matric_number, 
        name: student.name,
        department: student.department,
        level: student.level || '100L'
      });
      setCurrentStep('email');
      toast.success(`Welcome, ${student.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Check if email already registered
      const { data: existingEmail } = await supabase
        .from("voters")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existingEmail) {
        toast.error("This email is already registered. Please use a different email.");
        setLoading(false);
        return;
      }

      // Show verification choice
      setCurrentStep('verify_choice');
    } catch (error: any) {
      toast.error(error.message || "Failed to process email.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseBiometric = async () => {
    setCurrentStep('biometric');
  };

  const handleChooseOTP = async () => {
    await sendOTP();
  };

  const sendOTP = async () => {
    setLoading(true);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { email: email.toLowerCase(), type: 'verification' },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (otpError) {
        console.error("OTP send error:", otpError);
        toast.error("Failed to send verification code. Please try again.");
        setLoading(false);
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      toast.success("Verification code sent to your email!");
      setCurrentStep('otp');
    } catch (error: any) {
      console.error("OTP send exception:", error);
      toast.error("Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    if (!studentInfo) return;

    // Check if we're in an iframe (preview mode) - WebAuthn won't work there
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      toast.info("Biometric is not available in preview mode. Using email verification instead.");
      await sendOTP();
      return;
    }

    const credential = await registerCredential(studentInfo.matric, studentInfo.name);
    
    if (credential) {
      setBiometricSetupDone(true);
      toast.success("Biometric setup successful!");
      // Now complete registration
      await completeRegistration(credential);
    } else {
      toast.info("Biometric not available on this device. Using email verification instead.");
      await sendOTP();
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !studentInfo) return;
    
    setOtpLoading(true);
    try {
      // Verify OTP via edge function - pass type='registration' so it doesn't require voter profile
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: email.toLowerCase(), code: otp, type: 'registration' },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (error || !data?.valid) {
        toast.error(data?.error || "Invalid or expired code. Please try again.");
        setOtpLoading(false);
        return;
      }

      // OTP verified, complete registration
      await completeRegistration(null);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const completeRegistration = async (webauthnCredential: any) => {
    if (!studentInfo) return;

    setOtpLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            matric: studentInfo.matric,
            name: studentInfo.name,
          }
        }
      });

      if (authError) {
        if (authError.message?.includes("already registered")) {
          toast.error("This email is already registered with another account.");
        } else {
          toast.error(authError.message || "Registration failed. Please try again.");
        }
        setOtpLoading(false);
        return;
      }

      if (!authData.user?.id) {
        toast.error("Registration failed. Please try again.");
        setOtpLoading(false);
        return;
      }

      if (authData.user.identities && authData.user.identities.length === 0) {
        toast.error("This email is already registered. Please use a different email.");
        setOtpLoading(false);
        return;
      }

      // Create voter profile - mark as verified since email was verified via OTP
      const profileData: any = {
        user_id: authData.user.id,
        matric_number: studentInfo.matric,
        name: studentInfo.name,
        department: studentInfo.department,
        level: studentInfo.level,
        email: email.toLowerCase(),
        verified: true, // Email verified through OTP/biometric process
        has_voted: false
      };

      // Save biometric credential if available
      if (webauthnCredential) {
        profileData.webauthn_credential = webauthnCredential;
      }

      const { error: profileError } = await supabase
        .from("voters")
        .insert(profileData);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        if (profileError.message?.includes("duplicate key") || profileError.code === "23505") {
          toast.error("This matric number or email is already registered.");
        } else {
          toast.error("Failed to create your profile. Please try again.");
        }
        setOtpLoading(false);
        return;
      }

      // Assign voter role
      await supabase.from("user_roles").insert([{ user_id: authData.user.id, role: 'user' as const }]);

      setCurrentStep('success');
      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    try {
      const {  data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: email.toLowerCase(), type: 'verification' },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
      });

      if (error || data?.error) {
        toast.error(data?.error || "Failed to resend code. Please try again.");
      } else {
        toast.success("New verification code sent!");
        setOtp("");
      }
    } catch (error) {
      toast.error("Failed to resend code.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO 
        title="Voter Registration" 
        description="Register as a voter for COHSSA elections at Al-Hikmah University. Verify your matric number, set up biometric, and get ready to vote."
        keywords="voter registration, COHSSA elections, Al-Hikmah University, student elections, vote"
      />
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-lg px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => currentStep === 'matric' ? navigate("/") : setCurrentStep('matric')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 'matric' ? 'Back to Home' : 'Start Over'}
        </Button>

        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep || (currentStep === 'biometric' && step.id === 'verify_choice') || (currentStep === 'otp' && step.id === 'verify_choice') || (currentStep === 'consent' && step.id === 'consent');
              const isCompleted = getStepIndex(currentStep) > index || currentStep === 'success';
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${isCompleted ? 'bg-primary text-primary-foreground' : 
                      isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {isCompleted && !isActive ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step: Consent */}
        {currentStep === 'consent' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Terms & Consent</CardTitle>
              <CardDescription>Please review and accept before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/30 bg-primary/5">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your data privacy and security are important to us. Please read and accept the following terms.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${consentChecks.dataCollection ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}`}
                  onClick={() => setConsentChecks(prev => ({ ...prev, dataCollection: !prev.dataCollection }))}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="dataCollection" 
                      checked={consentChecks.dataCollection}
                      onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, dataCollection: checked as boolean }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="dataCollection" className="font-semibold cursor-pointer">
                        Data Collection Consent
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I consent to the collection of my personal information including my name, matric number, email address, department, and level for voter registration purposes. See our{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                          Privacy Policy
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${consentChecks.dataStorage ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}`}
                  onClick={() => setConsentChecks(prev => ({ ...prev, dataStorage: !prev.dataStorage }))}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="dataStorage" 
                      checked={consentChecks.dataStorage}
                      onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, dataStorage: checked as boolean }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="dataStorage" className="font-semibold cursor-pointer">
                        Data Storage & Use Consent
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I understand that my data will be securely stored and used solely for the purpose of verifying my eligibility to vote in COHSSA elections, as outlined in our{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                          Privacy Policy
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${consentChecks.termsConditions ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}`}
                  onClick={() => setConsentChecks(prev => ({ ...prev, termsConditions: !prev.termsConditions }))}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="termsConditions" 
                      checked={consentChecks.termsConditions}
                      onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, termsConditions: checked as boolean }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="termsConditions" className="font-semibold cursor-pointer">
                        Terms & Conditions
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                          Terms and Conditions
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {" "}and COHSSA Electoral Committee's rules and regulations. I understand that providing false information may result in disqualification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleConsentSubmit}
                disabled={!allConsentsChecked}
                className="w-full h-12 text-base gap-2"
              >
                I Agree & Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Matric Number */}
        {currentStep === 'matric' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <IdCard className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Enter Your Matric Number</CardTitle>
              <CardDescription>We'll verify you're a registered student</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMatricSubmit} className="space-y-6">
                <Alert className="border-primary/30 bg-primary/5">
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Enter your matric number exactly as on your student ID. Case doesn't matter (21/08NUS014 or 21/08nus014 both work).
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="matric" className="text-base font-medium">Matric Number</Label>
                  <Input
                    id="matric"
                    placeholder="e.g., 21/08NUS014"
                    value={matric}
                    onChange={(e) => {
                      setMatric(e.target.value);
                      validateMatricFormat(e.target.value);
                    }}
                    className={`h-14 text-lg text-center font-mono ${matricError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  {matricError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {matricError}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 text-base gap-2" disabled={loading || !!matricError}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-6">
                Already registered?{" "}
                <button onClick={() => navigate("/voter/login")} className="text-primary hover:underline font-medium">
                  Login here
                </button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step: Email */}
        {currentStep === 'email' && studentInfo && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Add Your Email</CardTitle>
              <CardDescription>You'll use this to verify your account</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Student Info Card */}
              <div className="mb-6 p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{studentInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{studentInfo.matric} • {studentInfo.department}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-lg"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Verification Choice */}
        {currentStep === 'verify_choice' && studentInfo && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Choose Verification Method</CardTitle>
              <CardDescription>How would you like to verify your account?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Biometric Option - Primary if supported */}
              {isSupported && (
                <button
                  onClick={handleChooseBiometric}
                  className="w-full p-5 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Fingerprint className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-lg flex items-center gap-2">
                        Biometric Setup
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Use fingerprint or face ID for quick, secure login</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              )}

              {/* OTP Option */}
              <button
                onClick={handleChooseOTP}
                disabled={loading}
                className="w-full p-5 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Email OTP Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {isSupported ? "Receive a 6-digit code via email" : "We'll send a verification code to your email"}
                    </p>
                  </div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>

              {!isSupported && (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <Smartphone className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Biometric authentication is not available on this device. You can still register using email verification.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Biometric Setup */}
        {currentStep === 'biometric' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Fingerprint className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Set Up Biometric Login</CardTitle>
              <CardDescription>Use fingerprint or face ID for secure access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/30 bg-primary/5">
                <Fingerprint className="h-4 w-4" />
                <AlertDescription>
                  Setting up biometric login allows you to access your account quickly and securely without entering codes each time.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleBiometricSetup} 
                className="w-full h-16 text-lg gap-3"
                disabled={webAuthnLoading || otpLoading}
              >
                {webAuthnLoading || otpLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-6 w-6" />
                    Set Up Biometric Now
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={sendOTP}
                className="w-full h-12 gap-2"
                disabled={loading || otpLoading}
              >
                <Mail className="h-5 w-5" />
                Use Email OTP Instead
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: OTP Verification */}
        {currentStep === 'otp' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>Enter the 6-digit code sent to {email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  onComplete={handleVerifyOTP}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-xs text-center text-muted-foreground">Code expires in 5 minutes</p>

              <Button 
                onClick={handleVerifyOTP}
                className="w-full h-12 text-base gap-2"
                disabled={otp.length !== 6 || otpLoading}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Complete
                    <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Didn't receive the code?{" "}
                <button 
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step: Success */}
        {currentStep === 'success' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
              <CardDescription>You're all set to participate in the elections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-2">Registered as</p>
                <p className="font-semibold text-lg">{studentInfo?.name}</p>
                <p className="text-sm text-muted-foreground">{studentInfo?.matric}</p>
                {biometricSetupDone && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                    <Fingerprint className="h-4 w-4" />
                    <span className="text-sm">Biometric enabled</span>
                  </div>
                )}
              </div>

              <Alert className="border-green-500/30 bg-green-500/5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Thank you for registering! Your voice matters. Return on election day to cast your vote and make a difference in shaping COHSSA's future.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => navigate("/")}
                className="w-full h-12 text-base gap-2"
              >
                Back to Homepage
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default VoterRegister;
