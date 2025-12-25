-- Enable realtime for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Also enable realtime for voters table to track has_voted changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.voters;