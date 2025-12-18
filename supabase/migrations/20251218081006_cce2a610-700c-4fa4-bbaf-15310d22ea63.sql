-- Fix Security Definer Views - Change to SECURITY INVOKER
-- Drop and recreate views with proper security settings

DROP VIEW IF EXISTS public.approved_aspirants_public;
DROP VIEW IF EXISTS public.approved_resources_public;
DROP VIEW IF EXISTS public.published_content_public;

-- Recreate views with SECURITY INVOKER (default, but explicit for clarity)
CREATE VIEW public.approved_aspirants_public
WITH (security_invoker = true) AS
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

CREATE VIEW public.approved_resources_public
WITH (security_invoker = true) AS
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
  seller_name
FROM public.resources
WHERE status = 'approved';

CREATE VIEW public.published_content_public
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  content,
  content_type,
  department,
  author_name,
  image_url,
  pdf_url,
  published_at,
  created_at
FROM public.editorial_content
WHERE status = 'published';