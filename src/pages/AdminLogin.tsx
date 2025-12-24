import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ArrowLeft, Mail, KeyRound, ArrowRight, Loader2, HelpCircle } from "lucide-react";
import { Logo } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import SEO from "@/components/SEO";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { showFriendlyError, showSuccessToast } from "@/lib/errorMessages";

// Validation schema for admin login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

const emailSchema = z.string().email("Please enter a valid email address");

type View = 'login' | 'forgot' | 'otp-verify' | 'new-password' | 'reset-sent';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        showFriendlyError("Invalid login credentials");
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          showFriendlyError("Permission denied");
          setLoading(false);
          return;
        }

        showSuccessToast("Welcome to ISECO Admin Dashboard");
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      showFriendlyError(error, "logging in");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: email.trim().toLowerCase(), type: 'admin-reset' }
      });

      if (error) throw error;
      
      if (data?.error) {
        showFriendlyError(data.error);
        setLoading(false);
        return;
      }

      setView('otp-verify');
      showSuccessToast("Verification code sent!", `Check your email at ${email}`);
    } catch (error: any) {
      showFriendlyError(error, "sending verification code");
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
      showFriendlyError(error, "verifying code");
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
      // Use Supabase magic link for actual password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) throw error;

      setView('reset-sent');
      showSuccessToast("Password reset email sent!", "Please check your inbox for the reset link.");
    } catch (error: any) {
      showFriendlyError(error, "resetting password");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setView('login');
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <SEO 
        title="Admin Login" 
        description="ISECO Electoral System Administration login portal for COHSSA elections management."
        keywords="admin login, ISECO admin, COHSSA elections management"
      />
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => view === 'login' ? navigate("/") : setView('login')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {view === 'login' ? 'Back to Home' : 'Back to Login'}
        </Button>
        
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              {view === 'login' && <><Shield className="h-6 w-6" /> Admin Login</>}
              {view === 'forgot' && <><KeyRound className="h-6 w-6" /> Reset Password</>}
              {view === 'otp-verify' && <><Mail className="h-6 w-6" /> Verify Email</>}
              {view === 'new-password' && <><KeyRound className="h-6 w-6" /> New Password</>}
              {view === 'reset-sent' && <><Mail className="h-6 w-6" /> Check Your Email</>}
            </CardTitle>
            <CardDescription>
              {view === 'login' && "ISECO Electoral System Administration"}
              {view === 'forgot' && "Enter your email to receive a verification code"}
              {view === 'otp-verify' && `Enter the 6-digit code sent to ${email}`}
              {view === 'new-password' && "Create a strong new password"}
              {view === 'reset-sent' && "We've sent you a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={errors.email ? "border-destructive" : ""}
                    autoComplete="email"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={errors.password ? "border-destructive" : ""}
                    autoComplete="current-password"
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : <>
                    <Shield className="mr-2 h-4 w-4" />
                    Login
                  </>}
                </Button>
              </form>
            )}

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
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    className={errors.email ? "border-destructive" : ""}
                    autoComplete="email"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>}
                </Button>
              </form>
            )}

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

            {view === 'reset-sent' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <Mail className="h-12 w-12 mx-auto text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Please check your inbox and follow the instructions.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setView('forgot')}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetState}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Return to Login
                </Button>
              </div>
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

export default AdminLogin;
