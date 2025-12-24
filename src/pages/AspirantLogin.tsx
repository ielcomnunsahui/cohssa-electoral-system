import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, ArrowLeft, Mail, KeyRound, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import { showFriendlyError, showSuccessToast } from "@/lib/errorMessages";

type View = 'login' | 'register' | 'forgot' | 'otp-verify' | 'new-password';

const AspirantLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("login");
  const [activeTab, setActiveTab] = useState("login");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

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
    setView('login');
    setOtp("");
    setOtpSent(false);
    setNewPassword("");
    setConfirmPassword("");
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
          onClick={() => view === 'login' ? navigate("/") : resetState()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {view === 'login' ? 'Back to Home' : 'Back to Login'}
        </Button>

        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">
              {view === 'login' && "Aspirant Portal"}
              {view === 'forgot' && "Forgot Password"}
              {view === 'otp-verify' && "Verify Your Email"}
              {view === 'new-password' && "Set New Password"}
            </CardTitle>
            <CardDescription>
              {view === 'login' && "Login or register to submit your application"}
              {view === 'forgot' && "Enter your email to receive a verification code"}
              {view === 'otp-verify' && `Enter the 6-digit code sent to ${email}`}
              {view === 'new-password' && "Create a strong new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
      </div>
    </div>
  );
};

export default AspirantLogin;
