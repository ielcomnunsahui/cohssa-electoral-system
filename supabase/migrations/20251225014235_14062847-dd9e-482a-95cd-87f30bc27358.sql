-- Drop and recreate the view with SECURITY INVOKER to respect RLS
DROP VIEW IF EXISTS public.voters_login_lookup;

CREATE VIEW public.voters_login_lookup WITH (security_invoker = on) AS
SELECT 
  id,
  matric_number,
  name,
  email,
  verified,
  webauthn_credential IS NOT NULL as has_biometric
FROM public.voters;

-- Since the view uses security_invoker, we need an RLS policy on voters that allows public read of limited info
-- Add a policy for anon users to read voter data for login purposes
CREATE POLICY "Public can lookup voters for login"
ON public.voters
FOR SELECT
TO anon
USING (true);

-- Grant SELECT on the view
GRANT SELECT ON public.voters_login_lookup TO anon;
GRANT SELECT ON public.voters_login_lookup TO authenticated;