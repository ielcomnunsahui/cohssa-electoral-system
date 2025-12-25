import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, LogIn, KeyRound, ArrowLeft, ShieldCheck, ExternalLink } from "lucide-react";
import { Logo } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

type AuthView = "consent" | "main" | "forgot-password" | "verify-otp" | "reset-password";

export const GlobalAuthDialog = () => {
  const { showAuthDialog, closeAuthDialog } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [authView, setAuthView] = useState<AuthView>("consent");
  const [otpSending, setOtpSending] = useState(false);
  
  // Consent states
  const [consentDataCollection, setConsentDataCollection] = useState(false);
  const [consentDataStorage, setConsentDataStorage] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  const allConsentsChecked = consentDataCollection && consentDataStorage && consentTerms;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setName("");
    setOtp("");
    setConsentDataCollection(false);
    setConsentDataStorage(false);
    setConsentTerms(false);
    setAuthView("consent");
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
      resetForm();
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("Password reset requires signing in first. Please contact support.");
        return;
      }

      toast.success("Password updated successfully!");
      resetForm();
      closeAuthDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    closeAuthDialog();
    resetForm();
  };

  return (
    <Dialog open={showAuthDialog} onOpenChange={(open) => {
      if (!open) {
        closeAuthDialog();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-16 w-16" />
          </div>
          <DialogTitle className="text-2xl">
            {authView === "consent" && "Terms & Consent"}
            {authView === "main" && "Welcome to ISECO"}
            {authView === "forgot-password" && "Reset Password"}
            {authView === "verify-otp" && "Verify Code"}
            {authView === "reset-password" && "Set New Password"}
          </DialogTitle>
          <DialogDescription>
            {authView === "consent" && "Please review and accept the following to continue"}
            {authView === "main" && "Sign in to access all features or continue as guest"}
            {authView === "forgot-password" && "Enter your email to receive a recovery code"}
            {authView === "verify-otp" && `Enter the 6-digit code sent to ${email}`}
            {authView === "reset-password" && "Create a new password for your account"}
          </DialogDescription>
        </DialogHeader>

        {authView === "consent" && (
          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-medium">Data Protection & Privacy</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-collection"
                    checked={consentDataCollection}
                    onCheckedChange={(checked) => setConsentDataCollection(checked as boolean)}
                  />
                  <Label htmlFor="consent-collection" className="text-sm leading-relaxed cursor-pointer">
                    I consent to the collection of my personal data (name, email, and usage information) for account management and service provision. See our{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                      Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-storage"
                    checked={consentDataStorage}
                    onCheckedChange={(checked) => setConsentDataStorage(checked as boolean)}
                  />
                  <Label htmlFor="consent-storage" className="text-sm leading-relaxed cursor-pointer">
                    I consent to the secure storage and processing of my data in accordance with applicable data protection regulations as outlined in our{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                      Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-terms"
                    checked={consentTerms}
                    onCheckedChange={(checked) => setConsentTerms(checked as boolean)}
                  />
                  <Label htmlFor="consent-terms" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">
                      Terms and Conditions
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}and AHSS rules and regulations.
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setAuthView("main")}
              className="w-full gap-2"
              disabled={!allConsentsChecked}
            >
              <ShieldCheck className="h-4 w-4" />
              Continue to Sign In
            </Button>

            <Button variant="outline" onClick={handleContinueAsGuest} className="w-full">
              Continue as Guest
            </Button>
          </div>
        )}

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

            <Button variant="ghost" onClick={() => setAuthView("consent")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consent
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
  );
};