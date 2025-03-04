
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to detect if a PDF page contains selectable text
async function hasSelectableText(pdfBytes: Uint8Array): Promise<boolean> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the text content
    const pages = pdfDoc.getPages();
    
    // Check if any page has text content
    for (let i = 0; i < Math.min(pages.length, 3); i++) {
      const page = pages[i];
      const text = await page.getTextContent?.();
      
      // If we have some text content that's more than just a few characters, it's likely a text-based PDF
      if (text && text.length > 50) {
        return true;
      }
    }
    
    // If we didn't find substantial text in the first few pages, it's likely an image-based PDF
    return false;
  } catch (error) {
    console.error("Error detecting selectable text:", error);
    // Default to image-based processing if we can't determine
    return false;
  }
}

// Function to convert PDF page to base64 image
async function convertPDFPageToBase64(pdfBytes: Uint8Array, pageIndex: number): Promise<string> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Extract the specific page
    const page = pdfDoc.getPages()[pageIndex];
    if (!page) {
      throw new Error(`Page index ${pageIndex} does not exist in the document`);
    }
    
    // Create a new PDF document with just this page
    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
    singlePagePdf.addPage(copiedPage);
    
    // Save as PDF bytes
    const singlePageBytes = await singlePagePdf.save();
    
    // Convert to base64
    const base64String = btoa(String.fromCharCode(...new Uint8Array(singlePageBytes)));
    
    return `data:application/pdf;base64,${base64String}`;
  } catch (error) {
    console.error(`Error converting PDF page ${pageIndex} to base64:`, error);
    throw error;
  }
}

// Function to extract text from PDF
async function extractTextFromPDF(pdfBytes: Uint8Array): Promise<string> {
  try {
    // This is a simplified version - in a real application, you'd use a more robust library
    // In Deno, PDF text extraction is limited, so this is a placeholder
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    // Simulate text extraction (in reality, you'd use a proper PDF text extraction library)
    return `Text extracted from ${pages.length} pages of the PDF document.`;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Function to extract data using GPT-4o for text-based PDFs
async function extractDataWithGPT4Text(pdfText: string, documentType: string): Promise<any> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not set in environment variables');
    }
    
    console.log(`Extracting data from ${documentType} using GPT-4 Text...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specializing in extracting structured data from hotel financial documents. 
            Extract all relevant information from the ${documentType} text provided.
            Return the data in a well-structured JSON format that includes all financial metrics, dates, room information, 
            occupancy details, revenue figures, and any other relevant information visible in the document.
            Use camelCase for property names and organize related data into nested objects where appropriate.
            Include metadata like processedBy: "GPT-4 Text" and processedAt (current timestamp).`
          },
          {
            role: "user",
            content: `Extract all relevant data from this ${documentType} document and format as structured JSON:\n\n${pdfText}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Received GPT-4 Text response');
    
    // Parse the JSON response from GPT-4
    let jsonResponse;
    try {
      // Extract JSON from the response text (it might be wrapped in markdown code blocks)
      const responseText = data.choices[0].message.content;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, responseText];
      
      const jsonString = jsonMatch[1] || responseText;
      jsonResponse = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Error parsing JSON from GPT-4 response:', parseError);
      console.log('Raw response:', data.choices[0].message.content);
      throw new Error('Failed to parse structured data from GPT-4 response');
    }
    
    // Add metadata if not already present
    if (!jsonResponse.processedBy) {
      jsonResponse.processedBy = "GPT-4 Text";
    }
    if (!jsonResponse.processedAt) {
      jsonResponse.processedAt = new Date().toISOString();
    }
    if (!jsonResponse.documentType) {
      jsonResponse.documentType = documentType;
    }
    
    return jsonResponse;
  } catch (error) {
    console.error('Error extracting data with GPT-4 Text:', error);
    throw error;
  }
}

// Function to extract structured data using GPT-4 Vision
async function extractDataWithGPT4Vision(base64Images: string[], documentType: string): Promise<any> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not set in environment variables');
    }
    
    console.log(`Extracting data from ${documentType} using GPT-4 Vision with ${base64Images.length} images...`);
    
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant specializing in extracting structured data from hotel financial documents. 
        Extract all relevant information from the ${documentType} document images provided.
        Return the data in a well-structured JSON format that includes all financial metrics, dates, room information, 
        occupancy details, revenue figures, and any other relevant information visible in the document.
        Use camelCase for property names and organize related data into nested objects where appropriate.
        Include metadata like processedBy: "GPT-4 Vision" and processedAt (current timestamp).`
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Extract all relevant data from this ${documentType} document and format as structured JSON:` },
          ...base64Images.map(image => ({ type: "image_url", image_url: { url: image } }))
        ]
      }
    ];
    
    console.log('Sending request to OpenAI API for vision analysis...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 4000,
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Received GPT-4 Vision response');
    
    // Parse the JSON response from GPT-4
    let jsonResponse;
    try {
      // Extract JSON from the response text (it might be wrapped in markdown code blocks)
      const responseText = data.choices[0].message.content;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, responseText];
      
      const jsonString = jsonMatch[1] || responseText;
      jsonResponse = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Error parsing JSON from GPT-4 response:', parseError);
      console.log('Raw response:', data.choices[0].message.content);
      throw new Error('Failed to parse structured data from GPT-4 response');
    }
    
    // Add metadata if not already present
    if (!jsonResponse.processedBy) {
      jsonResponse.processedBy = "GPT-4 Vision";
    }
    if (!jsonResponse.processedAt) {
      jsonResponse.processedAt = new Date().toISOString();
    }
    if (!jsonResponse.documentType) {
      jsonResponse.documentType = documentType;
    }
    
    return jsonResponse;
  } catch (error) {
    console.error('Error extracting data with GPT-4 Vision:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Hybrid PDF extraction function called');
    const { fileId, filePath, requestId } = await req.json();
    
    console.log('Received parameters:', { fileId, filePath, requestId });
    
    if (!fileId || !filePath || !requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: fileId, filePath, or requestId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    console.log('Supabase URL and key available:', !!supabaseUrl, !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials are not properly configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Log processing start
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Starting hybrid PDF processing with automatic detection',
      log_level: 'info'
    });
    
    // Get file details
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('document_type, filename')
      .eq('id', fileId)
      .single();
    
    if (fileError) {
      console.error('Error fetching file details:', fileError);
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error fetching file details: ${fileError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch file details', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('File details retrieved:', fileData);
    
    // Download PDF file from storage
    console.log('Attempting to download file from storage bucket:', 'pdf_files/' + filePath);
    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error downloading file: ${downloadError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log successful file download
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'File downloaded successfully, detecting PDF type',
      log_level: 'info'
    });
    
    // Convert PDF to array of Uint8Array for processing
    const pdfBytes = new Uint8Array(await fileBuffer.arrayBuffer());
    
    // Detect if PDF has selectable text
    const isTextBasedPDF = await hasSelectableText(pdfBytes);
    
    // Log PDF type detection result
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `PDF type detected: ${isTextBasedPDF ? 'Text-based' : 'Image-based'}`,
      log_level: 'info'
    });
    
    let extractedData;
    
    // Process based on PDF type
    if (isTextBasedPDF) {
      // Extract text from PDF for text-based documents
      const pdfText = await extractTextFromPDF(pdfBytes);
      
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: 'Text extracted from PDF, sending to GPT-4 Text API',
        log_level: 'info'
      });
      
      // Process text with OpenAI GPT-4 Chat API
      extractedData = await extractDataWithGPT4Text(pdfText, fileData.document_type || 'unknown');
    } else {
      // Load PDF document to get number of pages for image-based documents
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      // Log page count
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Image-based PDF has ${pageCount} pages, converting to images`,
        log_level: 'info'
      });
      
      // Convert first few pages to base64 strings (limit to maximum 5 pages to prevent token limits)
      const pagesToProcess = Math.min(pageCount, 5);
      const base64Images = [];
      
      for (let i = 0; i < pagesToProcess; i++) {
        try {
          const base64Page = await convertPDFPageToBase64(pdfBytes, i);
          base64Images.push(base64Page);
          
          await supabase.from('processing_logs').insert({
            file_id: fileId,
            request_id: requestId,
            message: `Converted page ${i + 1}/${pagesToProcess} to base64`,
            log_level: 'info'
          });
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          await supabase.from('processing_logs').insert({
            file_id: fileId,
            request_id: requestId,
            message: `Error processing page ${i + 1}: ${pageError.message}`,
            log_level: 'warning'
          });
        }
      }
      
      if (base64Images.length === 0) {
        await supabase.from('processing_logs').insert({
          file_id: fileId,
          request_id: requestId,
          message: 'Failed to convert any pages to base64',
          log_level: 'error'
        });
        
        return new Response(
          JSON.stringify({ error: 'Failed to convert any pages to base64' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Log successful conversion
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Successfully converted ${base64Images.length} pages, sending to GPT-4 Vision`,
        log_level: 'info'
      });
      
      // Extract structured data using GPT-4 Vision
      extractedData = await extractDataWithGPT4Vision(base64Images, fileData.document_type || 'unknown');
    }
    
    // Log successful extraction
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: `Successfully extracted data with ${isTextBasedPDF ? 'GPT-4 Text' : 'GPT-4 Vision'}`,
      log_level: 'info',
      details: { dataKeys: Object.keys(extractedData) }
    });
    
    // Update file record with extracted data
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        extracted_data: extractedData,
        processing: false,
        processed: true
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error('Error updating file with extracted data:', updateError);
      await supabase.from('processing_logs').insert({
        file_id: fileId,
        request_id: requestId,
        message: `Error updating file with extracted data: ${updateError.message}`,
        log_level: 'error'
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to update file with extracted data', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Final success log
    await supabase.from('processing_logs').insert({
      file_id: fileId,
      request_id: requestId,
      message: 'Processing completed successfully',
      log_level: 'info'
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'PDF processed successfully',
        pdfType: isTextBasedPDF ? 'text-based' : 'image-based',
        data: extractedData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in hybrid-pdf-extraction function:', error);
    
    // Create Supabase client for error logging
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        let errorInfo = { fileId: null, requestId: null };
        
        try {
          errorInfo = await req.json().catch(() => ({}));
        } catch(e) {
          console.error('Could not parse request JSON for error logging:', e);
        }
        
        await supabase.from('processing_logs').insert({
          file_id: errorInfo.fileId || null,
          request_id: errorInfo.requestId || null,
          message: `Error in hybrid-pdf-extraction function: ${error.message}`,
          log_level: 'error',
          details: { 
            stack: error.stack,
            errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
          }
        }).catch(logError => {
          console.error('Failed to log error to database:', logError);
        });
      }
    } catch (logError) {
      console.error('Error logging to database:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to process PDF', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
