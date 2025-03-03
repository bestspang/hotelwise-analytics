
-- Create processing_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  details JSONB,
  log_level TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS processing_logs_file_id_idx ON public.processing_logs(file_id);

-- Add RLS policies
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view all processing logs
CREATE POLICY "Users can view all processing logs" 
  ON public.processing_logs FOR SELECT 
  USING (true);

-- Allow service to insert logs
CREATE POLICY "Service can insert processing logs" 
  ON public.processing_logs FOR INSERT 
  WITH CHECK (true);
