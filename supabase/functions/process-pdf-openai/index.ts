
// This is a Supabase Edge Function to process PDF files with OpenAI's assistants API
import "https://deno.land/x/xhr@0.3.0/mod.ts"; 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: fileId or filePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing PDF with OpenAI. File ID: ${fileId}, Path: ${filePath}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get file details to determine document type
    const { data: fileDetails, error: fileError } = await supabase
      .from("uploaded_files")
      .select("document_type, filename")
      .eq("id", fileId)
      .single();
      
    if (fileError) {
      throw new Error(`Error retrieving file details: ${fileError.message}`);
    }
    
    const documentType = fileDetails.document_type || "Unknown";
    const filename = fileDetails.filename;
    
    console.log(`Document type: ${documentType}, Filename: ${filename}`);
    
    // Download the PDF from Supabase Storage
    console.log(`Downloading PDF from storage: pdf_files/${filePath}`);
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("pdf_files")
      .download(filePath);
      
    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF file: ${downloadError?.message || "No file data returned"}`);
    }
    
    console.log("PDF file downloaded successfully. File size:", fileData.size);
    
    // Process with OpenAI
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    
    // 1. Upload file to OpenAI
    console.log("Uploading file to OpenAI");
    const formData = new FormData();
    formData.append("purpose", "assistants");
    formData.append("file", new Blob([fileData], { type: "application/pdf" }), filename);
    
    const uploadResponse = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
      },
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`OpenAI file upload failed: ${JSON.stringify(errorData)}`);
    }
    
    const uploadData = await uploadResponse.json();
    const openaiFileId = uploadData.id;
    
    console.log(`File uploaded to OpenAI with ID: ${openaiFileId}`);
    
    // 2. Create an assistant with document-specific instructions
    let systemPrompt = `You are a hotel financial data extraction assistant. Extract structured data from this hotel document.`;
    
    // Customize instructions based on document type
    if (documentType === "Expense Voucher") {
      systemPrompt += ` This is an expense voucher. Extract all expense line items, amounts, dates, and approval information. Format the data as JSON with expense_items (array), total_amount, currency, date, and approval_status fields.`;
    } else if (documentType === "Monthly Statistics") {
      systemPrompt += ` This is a monthly statistics report. Extract occupancy rates, ADR, RevPAR, total revenue, room nights, and any other KPIs. Format as JSON with month, year, occupancy_rate, adr, revpar, total_revenue, and other relevant metrics.`;
    } else if (documentType === "Occupancy Report") {
      systemPrompt += ` This is an occupancy report. Extract daily occupancy rates, room sales, and availability. Format as JSON with date, occupancy_percentage, rooms_available, rooms_sold, and revenue_metrics fields.`;
    } else if (documentType === "City Ledger") {
      systemPrompt += ` This is a city ledger. Extract all accounts, balances, aging information, and transaction details. Format as JSON with accounts (array), total_outstanding, and aging_brackets fields.`;
    } else if (documentType === "Night Audit") {
      systemPrompt += ` This is a night audit report. Extract room revenue, occupancy, ADR, arrivals, departures, and other nightly metrics. Format as JSON with date, arrivals, departures, stayovers, revenue_breakdown, and occupancy_data fields.`;
    } else if (documentType === "No-show Report") {
      systemPrompt += ` This is a no-show report. Extract all bookings that did not arrive, including booking details and financial impact. Format as JSON with no_show_bookings (array), total_revenue_loss, and date fields.`;
    } else {
      systemPrompt += ` Extract all relevant financial and operational data from this document and return it as structured JSON.`;
    }
    
    console.log("Creating OpenAI assistant with custom instructions");
    const assistantResponse = await fetch("https://api.openai.com/v1/assistants", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        name: "Hotel Document Extractor",
        instructions: systemPrompt,
        tools: [{ type: "file_search" }],
        file_ids: [openaiFileId],
      }),
    });
    
    if (!assistantResponse.ok) {
      const errorData = await assistantResponse.json();
      throw new Error(`OpenAI assistant creation failed: ${JSON.stringify(errorData)}`);
    }
    
    const assistantData = await assistantResponse.json();
    const assistantId = assistantData.id;
    
    console.log(`Assistant created with ID: ${assistantId}`);
    
    // 3. Create a thread
    console.log("Creating thread");
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    
    if (!threadResponse.ok) {
      const errorData = await threadResponse.json();
      throw new Error(`OpenAI thread creation failed: ${JSON.stringify(errorData)}`);
    }
    
    const threadData = await threadResponse.json();
    const threadId = threadData.id;
    
    console.log(`Thread created with ID: ${threadId}`);
    
    // 4. Add a message to the thread
    console.log("Adding message to thread");
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "user",
        content: `Please extract all relevant data from this ${documentType} document and format it as structured JSON. Be comprehensive and include all financial and operational metrics found in the document.`,
        file_ids: [openaiFileId],
      }),
    });
    
    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      throw new Error(`OpenAI message creation failed: ${JSON.stringify(errorData)}`);
    }
    
    console.log("Message added successfully");
    
    // 5. Run the assistant
    console.log("Running the assistant");
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });
    
    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      throw new Error(`OpenAI run creation failed: ${JSON.stringify(errorData)}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    
    console.log(`Run created with ID: ${runId}`);
    
    // 6. Poll for completion
    let run;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // Timeout after 15 minutes (30 * 30 seconds)
    
    while (attempts < MAX_ATTEMPTS) {
      console.log(`Checking run status (attempt ${attempts + 1}/${MAX_ATTEMPTS})...`);
      
      const runStatusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${openAIKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!runStatusResponse.ok) {
        const errorData = await runStatusResponse.json();
        throw new Error(`OpenAI run status check failed: ${JSON.stringify(errorData)}`);
      }
      
      run = await runStatusResponse.json();
      console.log(`Run status: ${run.status}`);
      
      if (run.status === "completed") {
        break;
      } else if (run.status === "failed" || run.status === "cancelled" || run.status === "expired") {
        throw new Error(`OpenAI run failed with status: ${run.status}`);
      }
      
      // Wait 30 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 30000));
      attempts++;
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      throw new Error("OpenAI run timed out after 15 minutes");
    }
    
    // 7. Retrieve the messages
    console.log("Retrieving messages");
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(`OpenAI messages retrieval failed: ${JSON.stringify(errorData)}`);
    }
    
    const messagesData = await messagesResponse.json();
    const assistantMessages = messagesData.data.filter(msg => msg.role === "assistant");
    
    if (assistantMessages.length === 0) {
      throw new Error("No assistant messages found");
    }
    
    // Get the latest assistant message
    const latestMessage = assistantMessages[0];
    const contentValue = latestMessage.content[0].text.value;
    
    console.log("Retrieved assistant message:", contentValue.substring(0, 100) + "...");
    
    // Extract JSON from the message
    let extractedData;
    try {
      // First try to extract JSON if it's wrapped in code blocks
      const jsonMatch = contentValue.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        // If no code blocks, try to parse the whole content if it looks like JSON
        if (contentValue.trim().startsWith('{') && contentValue.trim().endsWith('}')) {
          extractedData = JSON.parse(contentValue);
        } else {
          // If all else fails, wrap the content in a basic structure
          extractedData = {
            raw_content: contentValue,
            extraction_method: "text_only",
            document_type: documentType
          };
        }
      }
    } catch (parseError) {
      console.error("Error parsing JSON from OpenAI response:", parseError);
      extractedData = {
        raw_content: contentValue,
        extraction_method: "text_only",
        parsing_error: true,
        document_type: documentType
      };
    }
    
    // Add metadata
    extractedData = {
      ...extractedData,
      metadata: {
        document_type: documentType,
        filename: filename,
        extraction_timestamp: new Date().toISOString(),
        model: "gpt-4o-mini"
      }
    };
    
    console.log("Extracted data prepared successfully");
    
    // 8. Clean up OpenAI resources in the background
    const cleanupResources = async () => {
      try {
        console.log("Cleaning up OpenAI resources");
        
        // Delete the assistant
        await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
        });
        
        // Delete the file
        await fetch(`https://api.openai.com/v1/files/${openaiFileId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("OpenAI resources cleaned up successfully");
      } catch (cleanupError) {
        console.error("Error cleaning up OpenAI resources:", cleanupError);
      }
    };
    
    // Run cleanup in the background (don't await)
    EdgeRuntime.waitUntil(cleanupResources());
    
    // 9. Update the database with the extracted data
    console.log("Updating database with extracted data");
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({
        extracted_data: extractedData,
        processed: true,
        processing: false,
        processed_at: new Date().toISOString()
      })
      .eq("id", fileId);
      
    if (updateError) {
      throw new Error(`Error updating database: ${updateError.message}`);
    }
    
    console.log("Database updated successfully");
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "PDF processed successfully",
        document_type: documentType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
