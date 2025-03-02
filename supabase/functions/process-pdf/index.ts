
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define cors headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the Deno runtime
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { fileId, filePath, filename, isReprocessing, notifyOnCompletion } = await req.json();

    console.log(`Processing file ${filename} (${fileId}), isReprocessing: ${isReprocessing}`);

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from('pdf_files')
      .download(filePath);

    if (fileError) {
      console.error('Error downloading file:', fileError);
      return new Response(
        JSON.stringify({ error: 'Failed to download the file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract document type if possible before full processing
    const documentTypeResult = await detectDocumentType(fileData);
    let documentType = documentTypeResult.documentType;

    console.log(`Detected document type: ${documentType}`);

    // Check for existing mappings for this document type
    const { data: existingMappings, error: mappingError } = await supabaseClient
      .from('data_mappings')
      .select('mappings')
      .eq('document_type', documentType)
      .maybeSingle();

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
    }

    // Process the PDF data
    let processingResult;
    if (existingMappings?.mappings && Object.keys(existingMappings.mappings).length > 0) {
      console.log('Using existing mappings for document type:', documentType);
      processingResult = await extractDataWithExistingMappings(fileData, existingMappings.mappings);
    } else {
      console.log('No existing mappings found, processing with AI');
      processingResult = await processWithAI(fileData);
      
      // Ensure document type is set
      if (!documentType && processingResult.documentType) {
        documentType = processingResult.documentType;
      }
    }

    // Update the file record with the extracted data
    const { error: updateError } = await supabaseClient
      .from('uploaded_files')
      .update({
        processed: true,
        extracted_data: {
          ...processingResult,
          documentType: documentType
        }
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file record:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update file record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification if requested
    if (notifyOnCompletion) {
      await sendProcessingNotification(fileId, filename);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File processed successfully',
        usedExistingMappings: existingMappings?.mappings !== undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Detects the document type from the first page of the PDF
 */
async function detectDocumentType(pdfData: Uint8Array): Promise<{ documentType: string }> {
  // For now, we'll use a simple detection based on the filename
  // In a real implementation, this would use AI to analyze the content
  return { documentType: "City Ledger" };
}

/**
 * Process PDF with AI to extract data and determine table mappings
 */
async function processWithAI(pdfData: Uint8Array) {
  // This function would use OpenAI's Vision API to extract all data
  // For now, we'll use a placeholder implementation with some mock data
  
  return {
    records: [
      { date: "2025-02-28", account: "Booking.com", amount: 1250.00, reference: "BOK-123456" },
      { date: "2025-02-28", account: "Expedia", amount: 980.75, reference: "EXP-654321" }
    ],
    metrics: {
      totalLedgerAmount: 2230.75,
      outstandingBalance: 1450.00,
      recentTransactions: 2
    },
    documentType: "City Ledger",
    // Add any additional properties as needed
  };
}

/**
 * Extract data using existing mappings without full AI processing
 */
async function extractDataWithExistingMappings(pdfData: Uint8Array, mappings: Record<string, string>) {
  // This function would use OCR or simpler extraction methods
  // and apply existing mappings to structure the data
  
  return {
    records: [
      { date: "2025-02-28", account: "Booking.com", amount: 1250.00, reference: "BOK-123456" },
      { date: "2025-02-28", account: "Expedia", amount: 980.75, reference: "EXP-654321" }
    ],
    metrics: {
      totalLedgerAmount: 2230.75,
      outstandingBalance: 1450.00,
      recentTransactions: 2
    },
    // Additional properties as needed
  };
}

/**
 * Send notification that processing is complete
 */
async function sendProcessingNotification(fileId: string, filename: string) {
  try {
    // Add a notification to the notifications table
    const { error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: 'system', // In a real implementation, this would be tied to the user who uploaded the file
        notification_text: `Processing of "${filename}" is complete.`,
        read_status: false,
        notification_type: 'file_processing',
        related_id: fileId
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
    
    // Additional notification methods like email could be implemented here
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
