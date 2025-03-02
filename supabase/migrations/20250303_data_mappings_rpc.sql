
-- Create RPC function to get data mappings
CREATE OR REPLACE FUNCTION get_data_mappings(p_document_type TEXT)
RETURNS SETOF data_mappings
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM data_mappings WHERE document_type = p_document_type;
$$;

-- Create RPC function to update data mapping
CREATE OR REPLACE FUNCTION update_data_mapping(p_document_type TEXT, p_mappings JSONB, p_updated_at TIMESTAMPTZ)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE data_mappings 
  SET mappings = p_mappings, updated_at = p_updated_at
  WHERE document_type = p_document_type;
$$;

-- Create RPC function to insert data mapping
CREATE OR REPLACE FUNCTION insert_data_mapping(p_document_type TEXT, p_mappings JSONB, p_created_at TIMESTAMPTZ)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO data_mappings (document_type, mappings, created_at, updated_at)
  VALUES (p_document_type, p_mappings, p_created_at, p_created_at);
$$;
