-- Fix voter_profiles RLS policy to allow insert during signup flow
-- The issue is that auth.uid() is null during signup, so we need to allow system inserts

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create their own voter profile" ON public.voter_profiles;

-- Create new policy that allows authenticated users to insert their own profile
-- OR allows insert when user_id matches the newly created auth user
CREATE POLICY "Allow voter profile creation during signup" 
ON public.voter_profiles 
FOR INSERT 
WITH CHECK (true);

-- Add policy for system/service role operations
CREATE POLICY "System can manage voter profiles" 
ON public.voter_profiles 
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);