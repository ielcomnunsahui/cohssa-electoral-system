import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, ArrowLeft, Mail, KeyRound, Loader2, HelpCircle, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import { showFriendlyError, showSuccessToast } from "@/lib/errorMessages";
import { Footer } from "@/components/Footer";

type View = 'consent' | 'login' | 'register' | 'forgot' | 'otp-verify' | 'new-password';

const AspirantLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("consent");
  const [activeTab, setActiveTab] = useState("login");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [consentChecks, setConsentChecks] = useState({
    dataCollection: false,
    dataStorage: false,
    termsConditions: false,
  });

  const allConsentsChecked = consentChecks.dataCollection && consentChecks.dataStorage && consentChecks.termsConditions;

  const handleConsentSubmit = () => {
    if (!allConsentsChecked) {
      toast.error("Please accept all consent items to continue");
      return;
    }
    setView('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        showSuccessToast("Login successful!");
        navigate("/aspirant/dashboard");
      }
    } catch (error: any) {
      showFriendlyError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/aspirant/login`,
        }
      });

      if (error) throw error;

      if (data.user) {
        showSuccessToast("Registration successful!", "Please check your email to verify your account, then login.");
        setActiveTab("login");
        setPassword("");
      }
    } catch (error: any) {
      showFriendlyError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: email.trim().toLowerCase(), type: 'password-reset' }
      });

      if (error) throw error;
      
      if (data?.error) {
        showFriendlyError(data.error);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setView('otp-verify');
      showSuccessToast("Verification code sent!", `Check your email at ${email}`);
    } catch (error: any) {
      showFriendlyError(error.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: email.trim().toLowerCase(), code: otp }
      });

      if (error || !data?.valid) {
        showFriendlyError(data?.error || "Invalid or expired code");
        setLoading(false);
        return;
      }

      setView('new-password');
      showSuccessToast("Code verified!", "Please set your new password.");
    } catch (error: any) {
      showFriendlyError(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);

    try {
      // First sign in with OTP, then update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showSuccessToast("Password reset successful!", "Please login with your new password.");
      setView('login');
      setActiveTab('login');
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpSent(false);
    } catch (error: any) {
      // If user not authenticated, try magic link approach
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/aspirant/login`,
      });
      
      if (resetError) {
        showFriendlyError(error.message || "Failed to reset password");
      } else {
        showSuccessToast("Password reset email sent!", "Please check your inbox for the reset link.");
        setView('login');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setView('consent');
    setOtp("");
    setOtpSent(false);
    setNewPassword("");
    setConfirmPassword("");
    setConsentChecks({ dataCollection: false, dataStorage: false, termsConditions: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <SEO 
        title="Aspirant Portal" 
        description="Login or register as an aspirant to submit your candidacy application for COHSSA elections."
        keywords="aspirant login, COHSSA elections, candidate application"
      />
      <div className="container mx-auto max-w-md py-8">
        <Button 
          variant="ghost" 
          onClick={() => view === 'consent' ? navigate("/") : (view === 'login' ? setView('consent') : resetState())}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {view === 'consent' ? 'Back to Home' : view === 'login' ? 'Back to Consent' : 'Back to Login'}
        </Button>

        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">
              {view === 'consent' && "Terms & Consent"}
              {view === 'login' && "Aspirant Portal"}
              {view === 'forgot' && "Forgot Password"}
              {view === 'otp-verify' && "Verify Your Email"}
              {view === 'new-password' && "Set New Password"}
            </CardTitle>
            <CardDescription>
              {view === 'consent' && "Please review and accept before proceeding"}
              {view === 'login' && "Login or register to submit your application"}
              {view === 'forgot' && "Enter your email to receive a verification code"}
              {view === 'otp-verify' && `Enter the 6-digit code sent to ${email}`}
              {view === 'new-password' && "Create a strong new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Consent View */}
            {view === 'consent' && (
              <div className="space-y-6">
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
                        id="aspirant-dataCollection" 
                        checked={consentChecks.dataCollection}
                        onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, dataCollection: checked as boolean }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="aspirant-dataCollection" className="font-semibold cursor-pointer">
                          Data Collection Consent
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          I consent to the collection of my personal information including my name, matric number, email, department, CGPA, and other application details for aspirant registration purposes. See our{" "}
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
                        id="aspirant-dataStorage" 
                        checked={consentChecks.dataStorage}
                        onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, dataStorage: checked as boolean }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="aspirant-dataStorage" className="font-semibold cursor-pointer">
                          Data Storage & Publication Consent
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          I understand that my application data and photo may be publicly displayed for campaign purposes. My data will be securely stored and used for election-related purposes as outlined in our{" "}
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
                        id="aspirant-termsConditions" 
                        checked={consentChecks.termsConditions}
                        onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, termsConditions: checked as boolean }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="aspirant-termsConditions" className="font-semibold cursor-pointer">
                          Terms & Conditions
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          I agree to the{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                            Terms and Conditions
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {" "}and COHSSA Electoral Committee's rules. I understand that providing false information may result in disqualification.
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
              </div>
            )}

            {/* Login/Register View */}
            {view === 'login' && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Login"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="link" 
                      className="w-full text-sm"
                      onClick={() => setView('forgot')}
                    >
                      Forgot Password?
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email Address</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a strong password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      After registration, you'll receive a verification email. Please verify your email before logging in.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* Forgot Password - Send OTP */}
            {view === 'forgot' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <Alert className="border-primary/30 bg-primary/5">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    We'll send a 6-digit verification code to your email address.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>}
                </Button>
              </form>
            )}

            {/* OTP Verification */}
            {view === 'otp-verify' && (
              <div className="space-y-4">
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
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Code"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { setOtp(""); handleSendOTP({ preventDefault: () => {} } as any); }}
                  disabled={loading}
                  className="w-full"
                >
                  Resend Code
                </Button>
              </div>
            )}

            {/* New Password */}
            {view === 'new-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </>}
                </Button>
              </form>
            )}

            {/* Help Link */}
            <div className="mt-6 text-center">
              <Link to="/voter/help" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Need help? Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <Footer showDualLogo={false} />
      </div>
    </div>
  );
};

export default AspirantLogin;
