-- Fix SECURITY DEFINER views by setting them to SECURITY INVOKER
-- This ensures RLS policies of the querying user are respected

ALTER VIEW public.cohssa_executives_public SET (security_invoker = on);
ALTER VIEW public.cohssa_senate_public SET (security_invoker = on);
ALTER VIEW public.electoral_committee_public SET (security_invoker = on);
ALTER VIEW public.cohssa_alumni_public SET (security_invoker = on);
ALTER VIEW public.approved_resources_public SET (security_invoker = on);

-- Also fix the existing views
ALTER VIEW public.approved_aspirants_public SET (security_invoker = on);
ALTER VIEW public.published_content_public SET (security_invoker = on);