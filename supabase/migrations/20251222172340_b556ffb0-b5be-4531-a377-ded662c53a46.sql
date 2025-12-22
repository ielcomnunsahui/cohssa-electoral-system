-- Enable realtime for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Set REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE public.votes REPLICA IDENTITY FULL;

-- Enable realtime for voters table (for has_voted tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.voters;
ALTER TABLE public.voters REPLICA IDENTITY FULL;

-- Enable realtime for election_timeline (for stage changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_timeline;
ALTER TABLE public.election_timeline REPLICA IDENTITY FULL;