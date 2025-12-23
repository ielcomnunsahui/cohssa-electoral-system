import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ArrowLeft, Mail, KeyRound, ArrowRight } from "lucide-react";
import { Logo } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import SEO from "@/components/SEO";

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

type View = 'login' | 'forgot' | 'reset-sent';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        toast.error("Invalid email or password");
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
          toast.error("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        toast.success("Welcome to ISECO Admin Dashboard");
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        toast.error("Failed to send reset email. Please try again.");
        setLoading(false);
        return;
      }

      setView('reset-sent');
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
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
              {view === 'reset-sent' && <><Mail className="h-6 w-6" /> Check Your Email</>}
            </CardTitle>
            <CardDescription>
              {view === 'login' && "ISECO Electoral System Administration"}
              {view === 'forgot' && "Enter your email to receive a reset link"}
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
                  <Shield className="mr-2 h-4 w-4" />
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? "Sending..." : "Send Reset Link"}
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
                  onClick={() => setView('login')}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Return to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
