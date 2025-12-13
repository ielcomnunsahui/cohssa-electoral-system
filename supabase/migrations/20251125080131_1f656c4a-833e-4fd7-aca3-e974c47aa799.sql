-- Create storage buckets for aspirant files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('aspirant-photos', 'aspirant-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
  ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']),
  ('referee-forms', 'referee-forms', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']);

-- RLS policies for aspirant-photos (public bucket)
CREATE POLICY "Anyone can view aspirant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'aspirant-photos');

CREATE POLICY "Authenticated users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'aspirant-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'aspirant-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'aspirant-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for payment-proofs (private bucket)
CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own payment proofs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for referee-forms (private bucket)
CREATE POLICY "Users can view their own referee forms"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'referee-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own referee forms"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'referee-forms' 
  AND auth.role() = 'authenticated'
);