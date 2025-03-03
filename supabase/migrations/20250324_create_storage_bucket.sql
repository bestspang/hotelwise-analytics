
-- Create storage bucket for PDF files if it doesn't exist
INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('pdf_files', 'pdf_files', null, now(), now(), false, false, 52428800, '{application/pdf}')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload files to pdf_files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pdf_files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their files in pdf_files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pdf_files' AND owner = auth.uid());

CREATE POLICY "Users can read their files in pdf_files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pdf_files' AND owner = auth.uid());

CREATE POLICY "Users can delete their files in pdf_files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pdf_files' AND owner = auth.uid());
