
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, approved } = await req.json();
    
    if (!fileId) {
      throw new Error('Missing required parameter: fileId');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Generate a request ID for logging and tracking
    const requestId = crypto.randomUUID();
    
    // Get the file record
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fileError) {
      throw new Error(`Failed to get file data: ${fileError.message}`);
    }
    
    if (!fileData) {
      throw new Error('File not found');
    }
    
    if (!fileData.extracted_data) {
      throw new Error('No extracted data available for this file');
    }
    
    // Log the action
    await logAction(supabase, requestId, fileId, approved ? 'Approving extracted data' : 'Rejecting extracted data');
    
    // Update the file record with approval/rejection status
    const updateData: any = {
      extracted_data: {
        ...fileData.extracted_data,
        approved: approved === true,
        rejected: approved === false
      }
    };
    
    // Insert the data if approved
    if (approved) {
      try {
        const targetTable = fileData.extracted_data.targetTable;
        const extractedData = { ...fileData.extracted_data };
        
        // Remove metadata fields
        delete extractedData.documentType;
        delete extractedData.targetTable;
        delete extractedData.extractedAt;
        delete extractedData.approved;
        delete extractedData.rejected;
        delete extractedData.inserted;
        
        // Insert into the target table
        if (targetTable && targetTable !== 'unknown') {
          // Add hotel_id if it's not present
          if (!extractedData.hotel_id) {
            extractedData.hotel_id = '00000000-0000-0000-0000-000000000000'; // Default hotel ID
          }
          
          const { error: insertError } = await supabase
            .from(targetTable)
            .insert(extractedData);
          
          if (insertError) {
            throw new Error(`Failed to insert data into ${targetTable}: ${insertError.message}`);
          }
          
          await logAction(supabase, requestId, fileId, `Data inserted into ${targetTable} successfully`);
          
          // Mark as inserted
          updateData.extracted_data.inserted = true;
        } else {
          await logAction(supabase, requestId, fileId, 'No target table specified, data not inserted');
        }
      } catch (insertError) {
        console.error('Error inserting data:', insertError);
        await logAction(supabase, requestId, fileId, `Error inserting data: ${insertError.message}`, 'error');
        
        // Still mark as approved, but not inserted
        updateData.extracted_data.inserted = false;
      }
    }
    
    // Update the file record
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update(updateData)
      .eq('id', fileId);
    
    if (updateError) {
      throw new Error(`Failed to update file status: ${updateError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: approved ? 'Data approved and inserted successfully' : 'Data rejected successfully',
        fileId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Error: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Log actions
async function logAction(
  supabase: any, 
  requestId: string,
  fileId: string,
  message: string,
  logLevel: 'info' | 'warning' | 'error' = 'info',
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('processing_logs')
      .insert({
        request_id: requestId,
        file_id: fileId,
        log_level: logLevel,
        message,
        details
      });
  } catch (error) {
    console.error('Error logging action:', error);
    // Continue despite logging error
  }
}
