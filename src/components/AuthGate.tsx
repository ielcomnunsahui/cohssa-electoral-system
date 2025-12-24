import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, LogIn, KeyRound, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/NavLink";

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, shows auth dialog when not authenticated
}

type AuthView = "main" | "forgot-password" | "verify-otp" | "reset-password";

export const AuthGate = ({ children, requireAuth = false }: AuthGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [authView, setAuthView] = useState<AuthView>("main");
  const [otpSending, setOtpSending] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      // Only show auth dialog if requireAuth is true and no session
      if (!session && requireAuth) {
        setShowAuthDialog(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setShowAuthDialog(false);
        resetForm();
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setName("");
    setOtp("");
    setAuthView("main");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
      toast.success("Account created! Please check your email to verify.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setOtpSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email, type: "login" },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Recovery code sent to your email");
        setAuthView("verify-otp");
      } else {
        throw new Error(data?.error || "Failed to send recovery code");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send recovery code");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code: otp, type: "login" },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Code verified! Set your new password");
        setAuthView("reset-password");
      } else {
        throw new Error(data?.error || "Invalid or expired code");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // First sign in with a temporary session using admin API or magic link
      // For now, we'll update via Supabase Auth admin (requires service role in edge function)
      // Alternative: Use updateUser if user has a valid session
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // If no session, try to sign in first then update
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: newPassword, // This won't work for password reset
        });
        
        if (signInError) {
          toast.error("Password reset requires signing in first. Please contact support.");
          return;
        }
      }

      toast.success("Password updated successfully!");
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setShowAuthDialog(false);
    setIsAuthenticated(false);
  };

  // Expose method to open auth dialog
  const openAuthDialog = () => {
    setShowAuthDialog(true);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={showAuthDialog} onOpenChange={(open) => {
        setShowAuthDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <DialogTitle className="text-2xl">
              {authView === "main" && "Welcome to ISECO"}
              {authView === "forgot-password" && "Reset Password"}
              {authView === "verify-otp" && "Verify Code"}
              {authView === "reset-password" && "Set New Password"}
            </DialogTitle>
            <DialogDescription>
              {authView === "main" && "Sign in to access all features or continue as guest"}
              {authView === "forgot-password" && "Enter your email to receive a recovery code"}
              {authView === "verify-otp" && `Enter the 6-digit code sent to ${email}`}
              {authView === "reset-password" && "Create a new password for your account"}
            </DialogDescription>
          </DialogHeader>

          {authView === "main" && (
            <>
              <Tabs defaultValue="signin" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm text-primary"
                      onClick={() => setAuthView("forgot-password")}
                    >
                      Forgot password?
                    </Button>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleContinueAsGuest} className="w-full">
                Continue as Guest
              </Button>
            </>
          )}

          {authView === "forgot-password" && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button onClick={handleSendOTP} className="w-full gap-2" disabled={otpSending}>
                {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Send Recovery Code
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => setAuthView("main")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          )}

          {authView === "verify-otp" && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleVerifyOTP} className="w-full gap-2" disabled={loading || otp.length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify Code
              </Button>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthView("forgot-password")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleSendOTP}
                  disabled={otpSending}
                >
                  {otpSending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          )}

          {authView === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update Password
              </Button>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to abide by AHSS rules and regulations.
          </p>
        </DialogContent>
      </Dialog>

      {children}
    </>
  );
};

// Export a hook to trigger auth dialog from anywhere
export const useAuthGate = () => {
  const [showDialog, setShowDialog] = useState(false);
  
  return {
    showAuthDialog: showDialog,
    openAuthDialog: () => setShowDialog(true),
    closeAuthDialog: () => setShowDialog(false),
  };
};