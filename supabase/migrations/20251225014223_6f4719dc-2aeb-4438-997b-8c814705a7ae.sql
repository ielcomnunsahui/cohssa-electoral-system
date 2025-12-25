-- Create a public view for voter login lookup (limited columns only)
CREATE OR REPLACE VIEW public.voters_login_lookup AS
SELECT 
  id,
  matric_number,
  name,
  email,
  verified,
  webauthn_credential IS NOT NULL as has_biometric
FROM public.voters;

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.voters_login_lookup TO anon;
GRANT SELECT ON public.voters_login_lookup TO authenticated;