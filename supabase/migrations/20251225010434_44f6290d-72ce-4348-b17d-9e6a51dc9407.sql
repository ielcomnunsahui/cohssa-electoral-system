-- Fix the remaining security warning: Add explicit deny policy for voters table
-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Voters can view own data" ON public.voters;

-- Recreate with more explicit policy
CREATE POLICY "Voters can only view their own data"
ON public.voters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add INSERT policy for voter registration (needed for the registration flow)
DROP POLICY IF EXISTS "Allow voter registration" ON public.voters;
CREATE POLICY "Allow voter registration"
ON public.voters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);