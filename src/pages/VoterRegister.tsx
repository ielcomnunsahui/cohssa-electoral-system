import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Mail, AlertCircle, Fingerprint, CheckCircle, User, IdCard, Shield, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Logo } from "@/components/NavLink";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";

// Strict matric validation regex: XX/XXaaa000 (e.g., 21/08nus014)
const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

const registrationSchema = z.object({
  matric: z
    .string()
    .min(1, "Matric number is required")
    .regex(MATRIC_REGEX, "Invalid matric format. Use: XX/XXaaa000 (e.g., 21/08nus014)"),
  email: z.string().email("Invalid email address"),
});

type Step = 'matric' | 'email' | 'biometric' | 'otp' | 'success';

const steps = [
  { id: 'matric', label: 'Matric', icon: IdCard },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'biometric', label: 'Biometric', icon: Fingerprint },
  { id: 'otp', label: 'Verify', icon: Shield },
];

const VoterRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('matric');
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [matricError, setMatricError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ matric: string; name: string; department: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  
  const { isSupported, isLoading: webAuthnLoading, checkSupport, registerCredential, saveCredential } = useWebAuthn();

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  const getStepIndex = (step: Step) => {
    const idx = steps.findIndex(s => s.id === step);
    return idx === -1 ? steps.length : idx;
  };

  const progress = ((getStepIndex(currentStep) + 1) / (steps.length + 1)) * 100;

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
        .from("voter_profiles")
        .select("id")
        .ilike("matric", inputMatric)
        .maybeSingle();

      if (existingProfile) {
        toast.error("This matric number is already registered. Please login instead.");
        setLoading(false);
        return;
      }

      // Verify matric exists in student list (case-insensitive using ILIKE)
      const { data: student, error: studentError } = await supabase
        .from("student_list")
        .select("*")
        .ilike("matric", inputMatric)
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
        matric: student.matric, 
        name: student.name,
        department: student.department 
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
        .from("voter_profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existingEmail) {
        toast.error("This email is already registered. Please use a different email.");
        setLoading(false);
        return;
      }

      // Send OTP via edge function
      const { error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { email: email.toLowerCase(), type: 'verification' }
      });

      if (otpError) {
        console.error("OTP send error:", otpError);
        toast.error("Failed to send verification code. Please try again.");
        setLoading(false);
        return;
      }

      // Try biometric first if supported
      if (isSupported) {
        setCurrentStep('biometric');
        toast.success("Let's set up quick login first!");
      } else {
        toast.success("Verification code sent to your email!");
        setCurrentStep('otp');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToOTP = async () => {
    setLoading(true);
    try {
      const { error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { email: email.toLowerCase(), type: 'verification' }
      });

      if (otpError) {
        toast.error("Failed to send verification code. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Verification code sent to your email!");
      setCurrentStep('otp');
    } catch (error: any) {
      toast.error("Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !studentInfo) return;
    
    setOtpLoading(true);
    try {
      // Verify OTP via edge function
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: email.toLowerCase(), code: otp }
      });

      if (error || !data?.valid) {
        toast.error(data?.error || "Invalid or expired code. Please try again.");
        setOtpLoading(false);
        return;
      }

      // OTP verified, now create user account
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

      // Create voter profile
      const profileData = {
        user_id: authData.user.id,
        matric: studentInfo.matric,
        name: studentInfo.name,
        email: email.toLowerCase(),
        verified: false,
        voted: false
      };

      const { error: profileError } = await supabase
        .from("voter_profiles")
        .insert(profileData);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        if (profileError.message?.includes("voter_profiles_matric_fkey")) {
          toast.error("Your matric number couldn't be verified. Please contact the electoral committee.");
        } else if (profileError.message?.includes("duplicate key") || profileError.code === "23505") {
          toast.error("This matric number or email is already registered.");
        } else {
          toast.error("Failed to create your profile. Please try again.");
        }
        setOtpLoading(false);
        return;
      }

      // Assign voter role
      await supabase.from("user_roles").insert({ user_id: authData.user.id, role: 'voter' });

      setCurrentStep('success');
      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email: email.toLowerCase(), type: 'verification' }
      });

      if (error) {
        toast.error("Failed to resend code. Please try again.");
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

  const handleBiometricSetup = async () => {
    if (!studentInfo) return;

    const credential = await registerCredential(studentInfo.matric, studentInfo.name);
    
    if (credential) {
      const saved = await saveCredential(studentInfo.matric, credential);
      if (saved) {
        toast.success("Biometric set up! Now verify your email.");
      }
    }
    
    // Always proceed to OTP verification after biometric attempt
    await proceedToOTP();
  };

  const skipBiometric = async () => {
    toast.info("Skipping biometric. Let's verify your email.");
    await proceedToOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
              const isActive = step.id === currentStep;
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
              <CardDescription>We'll send a verification code</CardDescription>
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
                  <p className="text-xs text-muted-foreground">You'll receive a 6-digit code that expires in 5 minutes</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep('matric')} className="flex-1 h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 h-12 gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Code
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
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
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-14 w-12 text-xl" />
                    <InputOTPSlot index={1} className="h-14 w-12 text-xl" />
                    <InputOTPSlot index={2} className="h-14 w-12 text-xl" />
                    <InputOTPSlot index={3} className="h-14 w-12 text-xl" />
                    <InputOTPSlot index={4} className="h-14 w-12 text-xl" />
                    <InputOTPSlot index={5} className="h-14 w-12 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">Code expires in 5 minutes</p>
              
              <Button 
                className="w-full h-12 text-base gap-2" 
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || otpLoading}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              
              <div className="flex flex-col gap-2">
                <Button variant="ghost" onClick={handleResendOTP} disabled={otpLoading} className="text-sm">
                  Didn't receive code? Resend
                </Button>
                <Button variant="outline" onClick={() => { setCurrentStep('email'); setOtp(""); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Biometric Setup */}
        {currentStep === 'biometric' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Set Up Quick Login</CardTitle>
              <CardDescription>Use fingerprint or face ID for faster, secure access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/30 bg-primary/5">
                <Fingerprint className="h-4 w-4" />
                <AlertDescription>
                  Biometric login requires HTTPS. It won't work in preview mode but will work on the deployed app.
                </AlertDescription>
              </Alert>
              
              <Button className="w-full h-12 text-base gap-2" onClick={handleBiometricSetup} disabled={webAuthnLoading}>
                <Fingerprint className="h-5 w-5" />
                {webAuthnLoading ? "Setting up..." : "Enable Biometric Login"}
              </Button>
              
              <Button variant="outline" className="w-full h-12" onClick={skipBiometric}>
                Skip - Use Email OTP Instead
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Success */}
        {currentStep === 'success' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">Registration Complete!</CardTitle>
              <CardDescription>Your voter registration is pending admin verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">
                  You will receive an email once your registration is verified. After verification, you can login to vote during the voting period.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/")} className="w-full h-12 text-base">
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => navigate("/voter/login")} className="w-full">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-sm text-foreground">ISECO</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterRegister;
