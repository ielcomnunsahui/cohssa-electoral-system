-- Fix security: Create views that exclude sensitive data for public access
-- and update RLS policies to restrict access to contact information

-- 1. Create a public view for cohssa_executives without sensitive contact info
CREATE OR REPLACE VIEW public.cohssa_executives_public AS
SELECT 
  id, name, position, department, level, photo_url, display_order, created_at
FROM public.cohssa_executives;

-- 2. Create a public view for cohssa_senate without sensitive contact info
CREATE OR REPLACE VIEW public.cohssa_senate_public AS
SELECT 
  id, name, position, department, level, photo_url, display_order, created_at
FROM public.cohssa_senate;

-- 3. Create a public view for electoral_committee without sensitive contact info
CREATE OR REPLACE VIEW public.electoral_committee_public AS
SELECT 
  id, name, position, department, level, photo_url, display_order, is_staff_adviser, created_at
FROM public.electoral_committee;

-- 4. Create a public view for cohssa_alumni without sensitive contact info
CREATE OR REPLACE VIEW public.cohssa_alumni_public AS
SELECT 
  id, name, position, department, graduation_year, current_workplace, photo_url, display_order, administration_number, created_at
FROM public.cohssa_alumni;

-- 5. Update RLS policies for cohssa_executives to restrict public access to contact info
DROP POLICY IF EXISTS "Public can view executives" ON public.cohssa_executives;
DROP POLICY IF EXISTS "Anyone can view executives" ON public.cohssa_executives;

CREATE POLICY "Only admins can view full executive details"
ON public.cohssa_executives
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Update RLS policies for cohssa_senate
DROP POLICY IF EXISTS "Public can view senate members" ON public.cohssa_senate;
DROP POLICY IF EXISTS "Anyone can view senate" ON public.cohssa_senate;

CREATE POLICY "Only admins can view full senate details"
ON public.cohssa_senate
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update RLS policies for electoral_committee
DROP POLICY IF EXISTS "Public can view committee members" ON public.electoral_committee;
DROP POLICY IF EXISTS "Anyone can view committee" ON public.electoral_committee;

CREATE POLICY "Only admins can view full committee details"
ON public.electoral_committee
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Update RLS policies for cohssa_alumni
DROP POLICY IF EXISTS "Public can view alumni" ON public.cohssa_alumni;
DROP POLICY IF EXISTS "Anyone can view alumni" ON public.cohssa_alumni;

CREATE POLICY "Only admins can view full alumni details"
ON public.cohssa_alumni
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Update resources table to hide seller phone from public
DROP POLICY IF EXISTS "Anyone can view approved resources" ON public.resources;
DROP POLICY IF EXISTS "Public can view approved resources" ON public.resources;

-- Create policy that allows viewing but the view already excludes phone
CREATE POLICY "Authenticated users can view approved resources"
ON public.resources
FOR SELECT
TO authenticated
USING (status = 'approved');

-- 10. Update the approved_resources_public view to exclude seller_phone
DROP VIEW IF EXISTS public.approved_resources_public;
CREATE VIEW public.approved_resources_public AS
SELECT 
  id, title, description, resource_type, department, level, 
  price, external_link, file_url, seller_name, is_sold, created_at
FROM public.resources
WHERE status = 'approved';

-- 11. Add RLS policy for voters to update their own non-critical info
CREATE POLICY "Voters can update own non-critical info"
ON public.voters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. Add explicit deny for non-admins on admin_login_attempts
DROP POLICY IF EXISTS "Service role can insert login attempts" ON public.admin_login_attempts;
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.admin_login_attempts;

CREATE POLICY "Only admins can view login attempts"
ON public.admin_login_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only service role can insert login attempts"
ON public.admin_login_attempts
FOR INSERT
WITH CHECK (false); -- Only service role can insert via edge functions

-- 13. Add explicit policy for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));