import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Fingerprint, Loader2, IdCard, Shield, ArrowRight, Vote, AlertCircle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DualLogo } from "@/components/NavLink";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import { showFriendlyError, showSuccessToast, showInfoToast } from "@/lib/errorMessages";

// Matric validation regex
const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

type Step = 'matric' | 'auth';

const VoterLogin = () => {
  const navigate = useNavigate();
  const [matric, setMatric] = useState("");
  const [matricError, setMatricError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>('matric');
  const [loading, setLoading] = useState(false);
  const [hasWebAuthn, setHasWebAuthn] = useState(false);
  const [voterInfo, setVoterInfo] = useState<{ name: string; email: string; matric: string } | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  const { isSupported, isLoading: webAuthnLoading, checkSupport, authenticate, getCredential } = useWebAuthn();

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

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
      showFriendlyError("Invalid format. Please enter a valid matric number (e.g., 21/08NUS014)");
      return;
    }
    
    setLoading(true);
    const inputMatric = matric.trim();

    try {
      // Find voter profile by matric (case-insensitive)
      const { data: profile, error: profileError } = await supabase
        .from('voters')
        .select('*')
        .ilike('matric_number', inputMatric)
        .maybeSingle();

      if (profileError || !profile) {
        showFriendlyError("Matric not found");
        setLoading(false);
        return;
      }

      if (!profile.verified) {
        showFriendlyError("pending verification");
        setLoading(false);
        return;
      }

      setVoterInfo({ name: profile.name, email: profile.email || '', matric: profile.matric_number });

      // Check if user has WebAuthn set up
      if (isSupported && profile.webauthn_credential) {
        setHasWebAuthn(true);
      }

      setCurrentStep('auth');
      showSuccessToast(`Welcome back, ${profile.name}!`);
    } catch (error: any) {
      console.error("Matric check error:", error);
      showFriendlyError(error, "verifying your matric number");
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!voterInfo) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: voterInfo.email, type: 'login' }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        showFriendlyError(data.error);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      showSuccessToast("Login code sent!", `Check your email at ${voterInfo.email}`);
    } catch (error: any) {
      console.error("OTP send error:", error);
      showFriendlyError(error, "sending login code");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!voterInfo) return;
    
    setLoading(true);
    try {
      const credential = await getCredential(voterInfo.email);
      if (!credential) {
        showFriendlyError("biometric_failed");
        setLoading(false);
        return;
      }

      const success = await authenticate(credential.credentialId);
      if (success) {
        // Biometric verified - mark voter as authenticated via session storage
        // and store voter info for the dashboard
        sessionStorage.setItem('voter_session', JSON.stringify({
          matric: voterInfo.matric,
          name: voterInfo.name,
          email: voterInfo.email,
          authenticated: true,
          method: 'biometric',
          timestamp: Date.now()
        }));
        
        showSuccessToast("Biometric login successful!");
        navigate("/voter/dashboard");
      }
    } catch (error: any) {
      console.error("Biometric login error:", error);
      showFriendlyError("biometric_failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !voterInfo) return;
    
    setLoading(true);
    try {
      // Verify OTP via edge function
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: voterInfo.email, code: otp }
      });

      if (error || !data?.valid) {
        showFriendlyError(data?.error || "Invalid or expired code");
        setLoading(false);
        return;
      }

      // If magic link token is provided, use it to sign in
      if (data.magicLink?.token_hash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.magicLink.token_hash,
          type: 'magiclink'
        });
        
        if (verifyError) {
          console.log("Magic link verification failed, proceeding with session storage");
        }
      }

      showSuccessToast(`Welcome back, ${data.voter?.name || voterInfo.name}!`);
      // Store session info for backup
      sessionStorage.setItem('voter_session', JSON.stringify({
        id: data.voter?.id,
        matric: data.voter?.matric,
        name: data.voter?.name,
        authenticated: true,
        timestamp: Date.now()
      }));
      navigate("/voter/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      showFriendlyError(error, "verifying your code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp("");
    await sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO 
        title="Voter Login" 
        description="Login to your ISECO voter account using biometric authentication or email OTP to cast your vote in COHSSA elections."
        keywords="voter login, ISECO, COHSSA elections, biometric login, student voting"
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
          {currentStep === 'matric' ? 'Back to Home' : 'Change Matric'}
        </Button>

        {/* Step: Matric Number */}
        {currentStep === 'matric' && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Vote className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Voter Login</CardTitle>
              <CardDescription>Enter your matric number to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMatricSubmit} className="space-y-6">
                <Alert className="border-primary/30 bg-primary/5">
                  <IdCard className="h-4 w-4" />
                  <AlertDescription>
                    Enter your matric number exactly as registered. Case doesn't matter.
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

              <div className="text-sm text-center text-muted-foreground mt-6 space-y-2">
                <p>
                  Not registered yet?{" "}
                  <button onClick={() => navigate("/voter/register")} className="text-primary hover:underline font-medium">
                    Register here
                  </button>
                </p>
                <p>
                  <Link to="/voter/help" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Need help? Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Authentication - Biometric First */}
        {currentStep === 'auth' && voterInfo && (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  {hasWebAuthn && isSupported ? (
                    <Fingerprint className="h-10 w-10 text-primary" />
                  ) : (
                    <Shield className="h-10 w-10 text-primary" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl">
                {hasWebAuthn && isSupported ? "Biometric Login" : "Verify Your Identity"}
              </CardTitle>
              <CardDescription>Welcome back, {voterInfo.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voter Info */}
              <div className="p-4 bg-muted/50 rounded-xl border text-center">
                <p className="font-medium text-foreground">{voterInfo.name}</p>
                <p className="text-sm text-muted-foreground">{voterInfo.matric}</p>
              </div>

              {/* Biometric First - Primary Option */}
              {hasWebAuthn && isSupported && !otpSent && (
                <>
                  <Alert className="border-primary/30 bg-primary/5">
                    <Fingerprint className="h-4 w-4" />
                    <AlertDescription>
                      Use your fingerprint or face recognition for quick, secure login.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    className="w-full h-16 text-lg gap-3 animate-pulse hover:animate-none" 
                    onClick={handleBiometricLogin}
                    disabled={loading || webAuthnLoading}
                  >
                    <Fingerprint className="h-7 w-7" />
                    {loading ? "Authenticating..." : "Login with Biometric"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-4 text-muted-foreground">Or use email code instead</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full h-12 text-base gap-3" 
                    onClick={sendOTP}
                    disabled={loading}
                  >
                    <Mail className="h-5 w-5" />
                    {loading ? "Sending..." : "Send Login Code to Email"}
                  </Button>
                </>
              )}

              {/* No Biometric - Email OTP Primary */}
              {(!hasWebAuthn || !isSupported) && !otpSent && (
                <Button 
                  className="w-full h-14 text-base gap-3" 
                  onClick={sendOTP}
                  disabled={loading}
                >
                  <Mail className="h-5 w-5" />
                  {loading ? "Sending..." : "Send Login Code to Email"}
                </Button>
              )}

              {/* OTP Input Section */}
              {otpSent && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="text-base">Enter 6-digit code sent to</Label>
                    <p className="text-sm text-muted-foreground">{voterInfo.email}</p>
                  </div>
                  
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
                    onClick={handleVerifyOTP}
                    className="w-full h-12 text-base gap-2" 
                    disabled={loading || otp.length !== 6}
                  >
                    <Mail className="h-5 w-5" />
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>

                  <div className="flex gap-2">
                    {hasWebAuthn && isSupported && (
                      <Button 
                        variant="outline" 
                        onClick={() => { setOtpSent(false); setOtp(""); }}
                        className="flex-1 gap-2"
                      >
                        <Fingerprint className="h-4 w-4" />
                        Use Biometric
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="flex-1"
                    >
                      Resend Code
                    </Button>
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={() => { setCurrentStep('matric'); setOtp(""); setOtpSent(false); }} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Use Different Matric
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DualLogo logoSize="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterLogin;
