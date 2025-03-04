
-- Create a storage bucket for PDF files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf_files', 'pdf_files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf_files');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Auth Users Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf_files');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Auth Users Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pdf_files' AND owner = auth.uid());

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Auth Users Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdf_files' AND owner = auth.uid());
