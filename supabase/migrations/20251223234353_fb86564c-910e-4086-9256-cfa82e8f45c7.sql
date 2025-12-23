-- Create rate_limits table for OTP rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  locked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits (edge functions use service role)
CREATE POLICY "Service role manages rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Update students table RLS: Remove public access, admin only
DROP POLICY IF EXISTS "Authenticated users can view basic student info" ON public.students;

CREATE POLICY "Only admins can view students"
ON public.students
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix aspirants: Create a secure view that hides sensitive data
DROP VIEW IF EXISTS public.approved_aspirants_public;

CREATE VIEW public.approved_aspirants_public AS
SELECT 
  id,
  name,
  full_name,
  department,
  level,
  position_id,
  photo_url,
  manifesto,
  why_running,
  status
FROM public.aspirants
WHERE status = 'approved';

-- Fix resources: Create a view that masks seller phone
DROP VIEW IF EXISTS public.approved_resources_public;

CREATE VIEW public.approved_resources_public AS
SELECT 
  id,
  title,
  description,
  resource_type,
  department,
  level,
  price,
  file_url,
  external_link,
  seller_name,
  is_sold,
  created_at
FROM public.resources
WHERE status = 'approved';

-- Add failed login attempts tracking for admin accounts
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  success boolean DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON public.admin_login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert login attempts
CREATE POLICY "Service role can insert login attempts"
ON public.admin_login_attempts
FOR INSERT
WITH CHECK (true);