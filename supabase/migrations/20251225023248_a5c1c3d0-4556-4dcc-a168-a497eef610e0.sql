-- First, drop the existing foreign key constraint on aspirant_id
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_aspirant_id_fkey;

-- Rename aspirant_id to candidate_id for clarity
ALTER TABLE public.votes RENAME COLUMN aspirant_id TO candidate_id;

-- Add foreign key constraint to candidates table
ALTER TABLE public.votes ADD CONSTRAINT votes_candidate_id_fkey 
  FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);

-- Update RLS policies to reflect the column rename
DROP POLICY IF EXISTS "Voters can cast votes" ON public.votes;
CREATE POLICY "Voters can cast votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM voters 
  WHERE voters.id = votes.voter_id 
  AND voters.user_id = auth.uid()
));