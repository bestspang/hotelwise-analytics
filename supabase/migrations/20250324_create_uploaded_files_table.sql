
-- Create uploaded_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  processing BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  document_type TEXT,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own files
CREATE POLICY "Users can view their own files" 
  ON public.uploaded_files FOR SELECT 
  USING (auth.uid() = auth.uid());

-- Allow users to insert their own files
CREATE POLICY "Users can insert their own files" 
  ON public.uploaded_files FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" 
  ON public.uploaded_files FOR UPDATE 
  USING (auth.uid() = auth.uid());
