-- Create resources storage bucket for textbook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for resources bucket
CREATE POLICY "Anyone can view resources" ON storage.objects
FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Anyone can upload to resources" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Owners can update their resources" ON storage.objects
FOR UPDATE USING (bucket_id = 'resources');

CREATE POLICY "Owners can delete their resources" ON storage.objects
FOR DELETE USING (bucket_id = 'resources');