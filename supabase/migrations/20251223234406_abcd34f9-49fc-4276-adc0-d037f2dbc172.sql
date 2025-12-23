-- Fix Security Definer Views by setting security_invoker = true
-- This ensures the views respect the querying user's RLS policies

-- Drop and recreate approved_aspirants_public with security_invoker
DROP VIEW IF EXISTS public.approved_aspirants_public;

CREATE VIEW public.approved_aspirants_public 
WITH (security_invoker = true)
AS
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

-- Drop and recreate approved_resources_public with security_invoker
DROP VIEW IF EXISTS public.approved_resources_public;

CREATE VIEW public.approved_resources_public 
WITH (security_invoker = true)
AS
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

-- Also fix the published_content_public view
DROP VIEW IF EXISTS public.published_content_public;

CREATE VIEW public.published_content_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  content,
  content_type,
  author_name,
  department,
  image_url,
  pdf_url,
  published_at,
  created_at
FROM public.editorial_content
WHERE status = 'published';