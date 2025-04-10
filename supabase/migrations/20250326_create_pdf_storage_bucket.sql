
-- Create a storage bucket for PDF files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pdf_files', 'PDF Files Storage', true, 50000000, '{application/pdf}')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload PDFs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pdf_files');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read PDFs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pdf_files');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own PDFs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pdf_files');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own PDFs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pdf_files');
