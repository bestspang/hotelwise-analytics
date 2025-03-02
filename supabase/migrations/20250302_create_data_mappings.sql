
-- Create data_mappings table to store document type to database field mappings
CREATE TABLE IF NOT EXISTS public.data_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type TEXT NOT NULL UNIQUE,
    mappings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.data_mappings IS 'Stores mappings between document types and database fields';

-- Create an index on document_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_data_mappings_document_type ON public.data_mappings (document_type);
