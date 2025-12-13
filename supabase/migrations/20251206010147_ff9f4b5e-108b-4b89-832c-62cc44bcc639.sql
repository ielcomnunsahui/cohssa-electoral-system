-- =============================================
-- FIX 1: VOTES TABLE - Prevent ballot stuffing
-- =============================================

-- Create a function to validate voting eligibility
CREATE OR REPLACE FUNCTION public.can_cast_vote(_user_id uuid, _issuance_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.voter_profiles
    WHERE user_id = _user_id
      AND issuance_token = _issuance_token
      AND verified = true
      AND voted = false
  )
$$;

-- Add UNIQUE constraint to prevent duplicate votes per position
ALTER TABLE public.votes 
ADD CONSTRAINT votes_unique_per_position 
UNIQUE (issuance_token, voting_position_id);

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can cast votes" ON public.votes;

-- Create a secure INSERT policy that validates voting eligibility
CREATE POLICY "Verified voters can cast one vote per position"
ON public.votes
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_cast_vote(auth.uid(), issuance_token)
);

-- =============================================
-- FIX 2: VOTER_PROFILES - Remove overly permissive policy
-- =============================================

-- Drop the overly permissive "System can manage voter profiles" policy
DROP POLICY IF EXISTS "System can manage voter profiles" ON public.voter_profiles;

-- =============================================
-- FIX 3: AUDIT_LOGS - Restrict INSERT to service role only
-- =============================================

-- Drop the overly permissive INSERT policy  
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;

-- Create a restrictive policy - only service role (via edge function) can insert
-- This works because authenticated users won't match this, only service_role bypasses RLS
CREATE POLICY "Only service role can create audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (false);
-- Note: Service role bypasses RLS, so this effectively means only edge function with service key can insert