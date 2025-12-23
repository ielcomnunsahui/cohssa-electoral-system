import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
}

// Rate limiting configuration for failed attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const checkVerificationRateLimit = async (supabase: any, email: string): Promise<{ allowed: boolean; message?: string }> => {
  const identifier = email.toLowerCase();
  const actionType = "verify_otp";

  const { data: rateLimit, error } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("action_type", actionType)
    .maybeSingle();

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }

  const now = new Date();

  if (rateLimit) {
    // Check if currently locked out
    if (rateLimit.locked_until && new Date(rateLimit.locked_until) > now) {
      const remainingMinutes = Math.ceil((new Date(rateLimit.locked_until).getTime() - now.getTime()) / 60000);
      return { 
        allowed: false, 
        message: `Account temporarily locked. Please try again in ${remainingMinutes} minute(s).` 
      };
    }

    // Check if too many failed attempts
    if (rateLimit.attempt_count >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
      await supabase
        .from("rate_limits")
        .update({
          locked_until: lockedUntil.toISOString(),
        })
        .eq("id", rateLimit.id);

      return { 
        allowed: false, 
        message: "Too many failed attempts. Account locked for 15 minutes." 
      };
    }
  }

  return { allowed: true };
};

const recordFailedAttempt = async (supabase: any, email: string) => {
  const identifier = email.toLowerCase();
  const actionType = "verify_otp";
  const now = new Date();

  const { data: rateLimit } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("action_type", actionType)
    .maybeSingle();

  if (rateLimit) {
    await supabase
      .from("rate_limits")
      .update({
        attempt_count: rateLimit.attempt_count + 1,
        last_attempt_at: now.toISOString(),
      })
      .eq("id", rateLimit.id);
  } else {
    await supabase
      .from("rate_limits")
      .insert({
        identifier,
        action_type: actionType,
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
      });
  }
};

const clearFailedAttempts = async (supabase: any, email: string) => {
  const identifier = email.toLowerCase();
  const actionType = "verify_otp";

  await supabase
    .from("rate_limits")
    .delete()
    .eq("identifier", identifier)
    .eq("action_type", actionType);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOTPRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit for verification attempts
    const rateLimitResult = await checkVerificationRateLimit(supabase, email);
    if (!rateLimitResult.allowed) {
      console.log(`Verification rate limit exceeded for ${email.substring(0, 3)}***`);
      return new Response(
        JSON.stringify({ error: rateLimitResult.message, valid: false }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("OTP lookup error:", otpError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!otpRecord) {
      // Record failed attempt
      await recordFailedAttempt(supabase, email);
      
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP", valid: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Clear failed attempts on success
    await clearFailedAttempts(supabase, email);

    // Get voter profile
    const { data: voterProfile, error: profileError } = await supabase
      .from("voters")
      .select("id, matric_number, name, email, verified, has_voted")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (profileError || !voterProfile) {
      return new Response(
        JSON.stringify({ error: "Voter profile not found", valid: false }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("OTP verified successfully for:", email.substring(0, 3) + "***");

    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: "OTP verified successfully",
        voter: {
          id: voterProfile.id,
          matric: voterProfile.matric_number,
          name: voterProfile.name,
          verified: voterProfile.verified,
          has_voted: voterProfile.has_voted
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify OTP" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
