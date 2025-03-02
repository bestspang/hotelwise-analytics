
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
    console.log("Process-PDF Edge Function invoked");
    
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

    console.log(`File downloaded successfully, size: ${fileData.size} bytes`);

    // Extract document type if possible before full processing
    const documentTypeResult = await detectDocumentType(fileData, filename);
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
      processingResult = await processWithAI(fileData, filename);
      
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
        document_type: documentType,
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

    console.log('File processed successfully, database updated');

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
 * Detects the document type from the PDF file name and content
 */
async function detectDocumentType(pdfData: Uint8Array, filename: string): Promise<{ documentType: string }> {
  // This is a simplified detection based on filename patterns
  // In a production environment, you would use more robust detection methods
  
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('cityledger') || lowerFilename.includes('ledger')) {
    return { documentType: "City Ledger" };
  } else if (lowerFilename.includes('expense') || lowerFilename.includes('voucher')) {
    return { documentType: "Expense Voucher" };
  } else if (lowerFilename.includes('statistics') || lowerFilename.includes('stats')) {
    return { documentType: "Monthly Statistics" };
  } else if (lowerFilename.includes('occupancy')) {
    return { documentType: "Occupancy Report" };
  } else if (lowerFilename.includes('nightaudit') || lowerFilename.includes('night_audit')) {
    return { documentType: "Night Audit" };
  } else if (lowerFilename.includes('noshow') || lowerFilename.includes('no-show')) {
    return { documentType: "No-show Report" };
  }
  
  // Default if no match found
  return { documentType: "Unknown" };
}

/**
 * Process PDF with AI to extract data and determine table mappings
 */
async function processWithAI(pdfData: Uint8Array, filename: string) {
  // This function would use OpenAI's Vision API to extract all data
  // For now, we'll use a placeholder implementation with mock data based on the filename
  
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('cityledger') || lowerFilename.includes('ledger')) {
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
      documentType: "City Ledger"
    };
  } else if (lowerFilename.includes('expense') || lowerFilename.includes('voucher')) {
    return {
      records: [
        { date: "2025-02-28", vendor: "Office Supplies Inc", amount: 450.25, category: "Supplies" },
        { date: "2025-02-28", vendor: "Cleaning Services Ltd", amount: 1200.00, category: "Services" }
      ],
      metrics: {
        totalExpenses: 1650.25,
        budgetUsage: "68%",
        categoryBreakdown: {
          Supplies: 450.25,
          Services: 1200.00
        }
      },
      documentType: "Expense Voucher"
    };
  } else if (lowerFilename.includes('statistics') || lowerFilename.includes('stats')) {
    return {
      records: [
        { month: "February", year: 2025, revPAR: 120.50, occupancy: 0.78 },
        { month: "January", year: 2025, revPAR: 115.20, occupancy: 0.75 }
      ],
      metrics: {
        averageRevPAR: 117.85,
        averageOccupancy: 0.765,
        yearToDateGrowth: "5.2%"
      },
      documentType: "Monthly Statistics"
    };
  } else {
    // Generic response for other document types
    return {
      records: [
        { date: "2025-02-28", key: "Value 1", metric: 100 },
        { date: "2025-02-28", key: "Value 2", metric: 200 }
      ],
      metrics: {
        total: 300,
        average: 150
      },
      documentType: "Unknown"
    };
  }
}

/**
 * Extract data using existing mappings without full AI processing
 */
async function extractDataWithExistingMappings(pdfData: Uint8Array, mappings: Record<string, string>) {
  // This function would use the mappings to extract data from the PDF
  // For now, return similar mock data as the AI version
  
  return {
    records: [
      { date: "2025-02-28", account: "Booking.com", amount: 1250.00, reference: "BOK-123456" },
      { date: "2025-02-28", account: "Expedia", amount: 980.75, reference: "EXP-654321" }
    ],
    metrics: {
      totalLedgerAmount: 2230.75,
      outstandingBalance: 1450.00,
      recentTransactions: 2
    }
  };
}

/**
 * Send notification that processing is complete
 */
async function sendProcessingNotification(fileId: string, filename: string) {
  try {
    console.log(`Sending notification for processed file: ${filename}`);
    
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
    } else {
      console.log('Notification created successfully');
    }
    
    // Additional notification methods like email could be implemented here
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
