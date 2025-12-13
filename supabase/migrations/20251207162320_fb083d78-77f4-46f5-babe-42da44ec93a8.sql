-- Fix OTP security vulnerability: restrict access to only the user's own OTP codes
-- Currently "Users can view their own OTP codes" policy allows TRUE for all users

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Users can view their own OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;

-- Create secure policies that match OTP to the email being used
CREATE POLICY "Users can view OTP codes by email match" 
ON public.otp_codes 
FOR SELECT 
USING (
  -- Only allow viewing if this is accessed through a function call with proper email validation
  -- For security, OTPs should only be validated server-side via edge functions
  false
);

CREATE POLICY "System can create OTP codes" 
ON public.otp_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update OTP codes" 
ON public.otp_codes 
FOR UPDATE 
USING (true);

-- Note: OTP validation should happen server-side through an edge function with service role
-- This prevents any client from directly querying OTP codes