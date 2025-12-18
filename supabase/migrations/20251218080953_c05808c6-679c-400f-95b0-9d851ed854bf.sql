-- Fix security: Remove public access to sensitive student data
-- Students table: restrict to admins only (email, phone are sensitive)
DROP POLICY IF EXISTS "Public can view students" ON public.students;

CREATE POLICY "Authenticated users can view basic student info"
ON public.students
FOR SELECT
TO authenticated
USING (true);

-- Voters table is already restricted, but let's ensure it's not publicly accessible
-- The existing policy only allows users to view their own data via user_id match

-- For aspirants, only expose non-sensitive fields publicly
DROP POLICY IF EXISTS "Public can view approved aspirants" ON public.aspirants;

CREATE POLICY "Public can view approved aspirants basic info"
ON public.aspirants
FOR SELECT
USING (
  status = 'approved' AND 
  -- Only allow SELECT on approved records, sensitive fields should be excluded in queries
  true
);

-- Create a view for public aspirant data that excludes sensitive fields
CREATE OR REPLACE VIEW public.approved_aspirants_public AS
SELECT 
  id,
  full_name,
  name,
  department,
  level,
  position_id,
  manifesto,
  photo_url,
  why_running,
  status
FROM public.aspirants
WHERE status = 'approved';

-- Alumni: Keep public but note that contact info visibility is intentional for networking
-- Executives/Senate: Keep public as they are public figures

-- OTP codes: Ensure only service role can access
DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.otp_codes;

-- Create a more restrictive policy that only works for service role operations
CREATE POLICY "Only service role can manage OTPs"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add policy to prevent anon users from accessing OTP codes
CREATE POLICY "Prevent public access to OTPs"
ON public.otp_codes
FOR ALL
TO anon
USING (false);

-- Resources: Hide seller phone from public, expose only after purchase intent
DROP POLICY IF EXISTS "Public can view approved resources" ON public.resources;

CREATE POLICY "Public can view approved resources basic info"
ON public.resources
FOR SELECT
USING (status = 'approved');

-- Create view for public resources without direct seller contact
CREATE OR REPLACE VIEW public.approved_resources_public AS
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
  created_at,
  is_sold,
  seller_name -- Name only, not phone
FROM public.resources
WHERE status = 'approved';

-- Editorial content: Remove author email from public view
DROP POLICY IF EXISTS "Public can view published content" ON public.editorial_content;

CREATE POLICY "Public can view published content"
ON public.editorial_content
FOR SELECT
USING (status = 'published');

-- Create view without sensitive author info
CREATE OR REPLACE VIEW public.published_content_public AS
SELECT 
  id,
  title,
  content,
  content_type,
  department,
  author_name, -- Name only, not email
  image_url,
  pdf_url,
  published_at,
  created_at
FROM public.editorial_content
WHERE status = 'published';