
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, filePath, documentType } = await req.json();
    
    if (!fileId || !filePath) {
      throw new Error('Missing required parameters: fileId and filePath are required');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Generate a request ID for logging and tracking
    const requestId = crypto.randomUUID();
    
    // Log the start of processing
    await logProcessingStep(supabase, requestId, fileId, 'info', 'Starting PDF processing', {
      documentType,
      filePath
    });
    
    console.log(`Processing file ${filePath} of type ${documentType || 'unknown'}`);
    
    // Get download URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('hotel-files')
      .getPublicUrl(filePath);
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL for the file');
    }
    
    await logProcessingStep(supabase, requestId, fileId, 'info', 'Fetching PDF content');
    
    // Fetch the PDF content
    const pdfResponse = await fetch(publicUrl);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF file: ' + pdfResponse.statusText);
    }
    
    // Convert to base64
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    
    await logProcessingStep(supabase, requestId, fileId, 'info', 'PDF fetched successfully', {
      fileSize: pdfBuffer.byteLength
    });
    
    // Determine document type if not provided
    let detectedDocType = documentType;
    if (!detectedDocType || detectedDocType === 'Unknown') {
      detectedDocType = await detectDocumentType(supabase, pdfBase64);
      await logProcessingStep(supabase, requestId, fileId, 'info', `Detected document type: ${detectedDocType}`);
      console.log(`Detected document type: ${detectedDocType}`);
    }
    
    // Update file record with document type
    await supabase
      .from('uploaded_files')
      .update({ document_type: detectedDocType })
      .eq('id', fileId);
    
    // Get data mappings for this document type
    const mappings = await getDataMappingsForDocType(supabase, detectedDocType);
    
    await logProcessingStep(supabase, requestId, fileId, 'info', 'Extracting data from PDF with AI', {
      documentType: detectedDocType,
      hasMappings: !!mappings
    });
    
    // Extract data using OpenAI
    const extractedData = await extractDataFromPDF(pdfBase64, detectedDocType, mappings);
    
    await logProcessingStep(supabase, requestId, fileId, 'info', 'AI data extraction completed', {
      status: 'success'
    });
    
    // Update the file record with the extracted data
    await supabase
      .from('uploaded_files')
      .update({ 
        extracted_data: extractedData,
        processed: true,
        processing: false
      })
      .eq('id', fileId);
    
    await logProcessingStep(supabase, requestId, fileId, 'info', 'Processing completed successfully');
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        fileId, 
        message: 'PDF processed successfully',
        documentType: detectedDocType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // If we have fileId, update the file record with the error
    const { fileId } = await req.json().catch(() => ({}));
    
    if (fileId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Log the error
      const requestId = crypto.randomUUID();
      await logProcessingStep(supabase, requestId, fileId, 'error', `Processing failed: ${error.message}`);
      
      // Update the file record with the error
      await supabase
        .from('uploaded_files')
        .update({ 
          extracted_data: { 
            error: true, 
            message: error.message 
          },
          processed: true,
          processing: false
        })
        .eq('id', fileId);
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Error processing PDF: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Detect document type using AI
async function detectDocumentType(supabase: any, pdfBase64: string): Promise<string> {
  try {
    // Get list of supported document types from data_mappings table
    const { data: mappings } = await supabase
      .from('data_mappings')
      .select('document_type')
      .order('document_type');
    
    const documentTypes = mappings ? mappings.map((m: any) => m.document_type) : [];
    
    // If no mappings available, use default types
    const supportedTypes = documentTypes.length > 0 ? documentTypes : [
      'expense_voucher',
      'monthly_statistics',
      'occupancy_report',
      'city_ledger',
      'night_audit',
      'no_show_report'
    ];
    
    // Ask OpenAI to identify the document type
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a hotel document classifier. Classify PDF documents into one of the following types: ${supportedTypes.join(', ')}. Return ONLY the document type as a string, no other text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the type of this hotel document. Respond with just the document type.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    let docType = result.choices[0].message.content.trim().toLowerCase();
    
    // Clean up and normalize the document type
    docType = docType.replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    docType = docType.replace(/\s+/g, '_');
    
    // Check if the document type is in the supported list
    if (!supportedTypes.map(t => t.toLowerCase()).includes(docType)) {
      // If not a direct match, find the closest match
      const normalizedTypes = supportedTypes.map(t => t.toLowerCase());
      for (const type of normalizedTypes) {
        if (docType.includes(type) || type.includes(docType)) {
          return type;
        }
      }
      return 'unknown';
    }
    
    return docType;
  } catch (error) {
    console.error('Error detecting document type:', error);
    return 'unknown';
  }
}

// Get data mappings for a specific document type
async function getDataMappingsForDocType(supabase: any, documentType: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('data_mappings')
      .select('mappings')
      .eq('document_type', documentType)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching data mappings:', error);
      return null;
    }
    
    return data?.mappings || null;
  } catch (error) {
    console.error('Error in getDataMappingsForDocType:', error);
    return null;
  }
}

// Extract data from PDF using OpenAI
async function extractDataFromPDF(pdfBase64: string, documentType: string, mappings: any): Promise<any> {
  try {
    let systemPrompt = `You are a hotel financial data extraction assistant. Extract structured data from the provided PDF document which is a ${documentType.replace(/_/g, ' ')}. `;
    
    // Determine target table based on document type
    let targetTable = documentType;
    
    // If mappings are available, use them to guide extraction
    if (mappings) {
      systemPrompt += `Extract the following fields according to the provided mapping:\n`;
      
      for (const [field, mapping] of Object.entries(mappings)) {
        systemPrompt += `- ${field}: ${mapping}\n`;
      }
    } else {
      // Default extraction guidance based on document type
      systemPrompt += 'Extract all relevant financial and operational data in a structured JSON format. ';
      
      switch (documentType) {
        case 'expense_voucher':
          systemPrompt += 'Include fields like expense_type, expense_amount, expense_date, taxes_included, and remarks.';
          targetTable = 'expense_vouchers';
          break;
        case 'monthly_statistics':
          systemPrompt += 'Include metrics like total_revenue, room_revenue, fnb_revenue, operational_expenses, net_profit, and report_date.';
          targetTable = 'financial_reports';
          break;
        case 'occupancy_report':
          systemPrompt += 'Include metrics like occupancy_rate, average_daily_rate, revenue_per_available_room, total_rooms_occupied, total_rooms_available, and report_date.';
          targetTable = 'occupancy_reports';
          break;
        case 'city_ledger':
          systemPrompt += 'Include account_name, reference_number, opening_balance, closing_balance, charges, payments, and ledger_date.';
          targetTable = 'city_ledger';
          break;
        case 'night_audit':
          systemPrompt += 'Include room_id, audit_date, revenue, taxes, charges, balance, and notes.';
          targetTable = 'night_audit_details';
          break;
        case 'no_show_report':
          systemPrompt += 'Include report_date, number_of_no_shows, potential_revenue_loss.';
          targetTable = 'no_show_reports';
          break;
        default:
          systemPrompt += 'Extract any relevant financial or operational data you can find.';
          targetTable = 'unknown';
      }
    }
    
    systemPrompt += '\nReturn ONLY a JSON object with the extracted data, no other text.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract structured data from this ${documentType.replace(/_/g, ' ')}. Return as JSON only.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse the JSON response
    let extractedData;
    try {
      // Handle case where OpenAI might wrap the JSON in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1].trim();
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      console.log('Raw response:', content);
      
      // Try more aggressive JSON extraction
      const jsonRegex = /\{[\s\S]*\}/;
      const match = content.match(jsonRegex);
      
      if (match) {
        try {
          extractedData = JSON.parse(match[0]);
        } catch (secondParseError) {
          throw new Error('Failed to parse structured data from OpenAI response');
        }
      } else {
        throw new Error('Failed to extract structured data from OpenAI response');
      }
    }
    
    // Add metadata
    return {
      ...extractedData,
      documentType,
      targetTable,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting data from PDF:', error);
    throw error;
  }
}

// Log processing steps
async function logProcessingStep(
  supabase: any, 
  requestId: string,
  fileId: string,
  logLevel: 'info' | 'warning' | 'error',
  message: string,
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
    console.error('Error logging processing step:', error);
    // Continue despite logging error
  }
}
