
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, approved } = await req.json();

    if (!fileId || approved === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the file record with extracted data
    const { data: fileData, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: `Failed to retrieve file: ${fileError?.message || "File not found"}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // If rejected, just update the file record
    if (!approved) {
      const { error: updateError } = await supabase
        .from("uploaded_files")
        .update({
          extracted_data: {
            ...fileData.extracted_data,
            approved: false,
            rejected: true,
            updatedAt: new Date().toISOString(),
          },
        })
        .eq("id", fileId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update file: ${updateError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      await supabase.from("processing_logs").insert({
        file_id: fileId,
        request_id: crypto.randomUUID(),
        log_level: "info",
        message: "User rejected extracted data",
      });

      return new Response(
        JSON.stringify({ success: true, message: "Extracted data rejected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If approved, proceed with inserting data into appropriate tables
    const extractedData = fileData.extracted_data?.data;
    const documentType = fileData.document_type || fileData.extracted_data?.documentType;

    if (!extractedData) {
      return new Response(
        JSON.stringify({ error: "No extracted data found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log the start of data insertion
    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "info",
      message: `Starting data insertion for document type: ${documentType}`,
      details: { documentType }
    });

    // Get hotel ID (using the first hotel in the database for now - in a real app you'd select the appropriate hotel)
    const { data: hotels, error: hotelsError } = await supabase
      .from("hotels")
      .select("hotel_id")
      .limit(1);

    if (hotelsError || !hotels || hotels.length === 0) {
      // Create a default hotel if none exists
      const { data: newHotel, error: createHotelError } = await supabase
        .from("hotels")
        .insert({
          hotel_name: "Default Hotel",
          location: "Default Location"
        })
        .select("hotel_id")
        .single();

      if (createHotelError) {
        return new Response(
          JSON.stringify({ error: `Failed to create default hotel: ${createHotelError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      var hotelId = newHotel.hotel_id;
    } else {
      var hotelId = hotels[0].hotel_id;
    }

    // Insert data into appropriate tables based on document type
    let insertResult;
    let tableName = "";

    switch (documentType?.toLowerCase()) {
      case "expense voucher":
        tableName = "expense_vouchers";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          expense_date: extractedData.expense_date || new Date().toISOString().split('T')[0],
          expense_type: extractedData.expense_type || "Other",
          expense_amount: extractedData.expense_amount || 0,
          taxes_included: extractedData.taxes_included || 0,
          remarks: extractedData.remarks || ""
        });
        break;
        
      case "monthly statistics":
      case "statistics report":
        tableName = "financial_reports";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          report_date: extractedData.report_date || new Date().toISOString().split('T')[0],
          report_type: "Monthly",
          room_revenue: extractedData.room_revenue || 0,
          fnb_revenue: extractedData.fnb_revenue || 0,
          other_revenue: extractedData.other_revenue || 0,
          total_revenue: extractedData.total_revenue || 0,
          operational_expenses: extractedData.operational_expenses || 0,
          net_profit: extractedData.net_profit || 0
        });
        break;
        
      case "occupancy report":
        tableName = "occupancy_reports";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          date: extractedData.date || new Date().toISOString().split('T')[0],
          occupancy_rate: extractedData.occupancy_rate || 0,
          average_daily_rate: extractedData.average_daily_rate || 0,
          revenue_per_available_room: extractedData.revpar || 0,
          total_rooms_available: extractedData.total_rooms_available || 0,
          total_rooms_occupied: extractedData.total_rooms_occupied || 0,
          average_length_of_stay: extractedData.average_length_of_stay || 0
        });
        break;
        
      case "city ledger":
        tableName = "city_ledger";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          ledger_date: extractedData.ledger_date || new Date().toISOString().split('T')[0],
          account_name: extractedData.account_name || "Unknown",
          opening_balance: extractedData.opening_balance || 0,
          charges: extractedData.charges || 0,
          payments: extractedData.payments || 0,
          closing_balance: extractedData.closing_balance || 0,
          reference_number: extractedData.reference_number || null
        });
        break;
        
      case "night audit":
        tableName = "night_audit_details";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          audit_date: extractedData.audit_date || new Date().toISOString().split('T')[0],
          revenue: extractedData.revenue || 0,
          charges: extractedData.charges || 0,
          taxes: extractedData.taxes || 0,
          balance: extractedData.balance || 0,
          notes: extractedData.notes || ""
        });
        break;
        
      case "no-show report":
        tableName = "no_show_reports";
        insertResult = await supabase.from(tableName).insert({
          hotel_id: hotelId,
          report_date: extractedData.report_date || new Date().toISOString().split('T')[0],
          number_of_no_shows: extractedData.number_of_no_shows || 0,
          potential_revenue_loss: extractedData.potential_revenue_loss || 0
        });
        break;
        
      default:
        // For unknown document types, store in a generic log
        await supabase.from("processing_logs").insert({
          file_id: fileId,
          request_id: crypto.randomUUID(),
          log_level: "warning",
          message: `Unknown document type: ${documentType}`,
          details: { extractedData }
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            warning: `Unknown document type: ${documentType}. Data not inserted.` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (insertResult.error) {
      await supabase.from("processing_logs").insert({
        file_id: fileId,
        request_id: crypto.randomUUID(),
        log_level: "error",
        message: `Failed to insert data into ${tableName}: ${insertResult.error.message}`,
        details: { error: insertResult.error }
      });
      
      return new Response(
        JSON.stringify({ error: `Failed to insert data: ${insertResult.error.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Update the file record to mark data as approved and inserted
    const { error: updateError } = await supabase
      .from("uploaded_files")
      .update({
        extracted_data: {
          ...fileData.extracted_data,
          approved: true,
          rejected: false,
          inserted: true,
          insertedAt: new Date().toISOString(),
          targetTable: tableName
        },
      })
      .eq("id", fileId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update file: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Log successful completion
    await supabase.from("processing_logs").insert({
      file_id: fileId,
      request_id: crypto.randomUUID(),
      log_level: "info",
      message: `Data successfully inserted into ${tableName}`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Data successfully inserted into ${tableName}`,
        table: tableName
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in insert-extracted-data function:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
