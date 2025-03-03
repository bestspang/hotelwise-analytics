
-- Add updated_at column to uploaded_files table
ALTER TABLE IF EXISTS public.uploaded_files 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.uploaded_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
