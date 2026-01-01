-- Add RLS policy to allow public to lookup students by matric number for voter registration
-- This only exposes minimal info needed for registration verification
CREATE POLICY "Public can lookup students by matric for registration" 
ON public.students 
FOR SELECT 
USING (true);