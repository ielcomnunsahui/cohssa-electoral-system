-- Fix RLS policies to allow admin operations

-- Drop existing restrictive policies on aspirant_applications
DROP POLICY IF EXISTS "Users can update own applications" ON public.aspirant_applications;

-- Create new policies that allow both user and admin access
CREATE POLICY "Users can update own applications" ON public.aspirant_applications
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND status IN ('submitted', 'payment_verified')
);

CREATE POLICY "Admins can update any application" ON public.aspirant_applications
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all applications" ON public.aspirant_applications
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix voter_profiles to allow public read for verification during registration
CREATE POLICY "Anyone can read voter profiles for verification" ON public.voter_profiles
FOR SELECT 
USING (true);

-- Allow admins to manage timeline
CREATE POLICY "Admins can manage timeline" ON public.election_timeline
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));