
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define CORS headers
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
    const requestId = uuidv4();
    const { fileId, documentType, extractedData } = await req.json();

    // Log the start of data insertion
    await logProcessingStep(requestId, fileId, "info", "Starting data insertion", { 
      documentType 
    });

    if (!extractedData) {
      throw new Error("No extracted data provided");
    }

    // Default hotel ID if not specified
    const hotelId = extractedData.hotelId || "00000000-0000-0000-0000-000000000000";
    
    // Insert data into appropriate tables based on document type
    switch (documentType.toLowerCase()) {
      case "expense voucher":
        await insertExpenseVoucher(extractedData, hotelId, requestId, fileId);
        break;
      
      case "monthly statistics":
        await insertFinancialReport(extractedData, hotelId, requestId, fileId);
        break;
      
      case "occupancy report":
        await insertOccupancyReport(extractedData, hotelId, requestId, fileId);
        break;
      
      case "city ledger":
        await insertCityLedger(extractedData, hotelId, requestId, fileId);
        break;
      
      case "night audit":
        await insertNightAudit(extractedData, hotelId, requestId, fileId);
        break;
      
      case "no-show report":
        await insertNoShowReport(extractedData, hotelId, requestId, fileId);
        break;
      
      default:
        await logProcessingStep(requestId, fileId, "warning", "Unknown document type, storing as raw data only", {
          documentType
        });
    }

    // Update the file record to indicate successful insertion
    await supabase
      .from("uploaded_files")
      .update({
        extracted_data: {
          ...extractedData,
          inserted: true,
          insertedAt: new Date().toISOString()
        }
      })
      .eq("id", fileId);

    await logProcessingStep(requestId, fileId, "success", "Data inserted successfully");

    return new Response(
      JSON.stringify({
        message: "Data inserted successfully",
        fileId,
        documentType
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error inserting data:", error);
    
    let fileId = null;
    try {
      const body = await req.json();
      fileId = body.fileId;
    } catch {}
    
    if (fileId) {
      await logProcessingStep(uuidv4(), fileId, "error", "Data insertion failed", { 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error during insertion",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Log each step of the processing to the processing_logs table
async function logProcessingStep(
  requestId: string,
  fileId: string,
  logLevel: "info" | "success" | "warning" | "error",
  message: string,
  details = {}
) {
  try {
    await supabase.from("processing_logs").insert({
      request_id: requestId,
      file_id: fileId,
      log_level: logLevel,
      message: message,
      details: details,
    });
  } catch (error) {
    console.error("Error logging processing step:", error);
  }
}

// Insert expense voucher data
async function insertExpenseVoucher(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let expenseDate = data.expenseDate;
    if (typeof expenseDate === "string") {
      expenseDate = new Date(expenseDate).toISOString().split("T")[0];
    }

    // Convert amounts to numbers if they're strings
    const expenseAmount = typeof data.expenseAmount === "string" 
      ? parseFloat(data.expenseAmount.replace(/[^0-9.-]+/g, ""))
      : data.expenseAmount;
      
    const taxesIncluded = typeof data.taxesIncluded === "string"
      ? parseFloat(data.taxesIncluded.replace(/[^0-9.-]+/g, ""))
      : data.taxesIncluded || 0;

    // Insert into expense_vouchers table
    const { error } = await supabase.from("expense_vouchers").insert({
      expense_type: data.expenseType,
      expense_amount: expenseAmount,
      expense_date: expenseDate,
      taxes_included: taxesIncluded,
      remarks: data.remarks,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    await logProcessingStep(requestId, fileId, "info", "Expense voucher data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert expense voucher data", {
      error: error.message
    });
    throw error;
  }
}

// Insert financial report data
async function insertFinancialReport(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let reportDate = data.reportDate;
    if (typeof reportDate === "string") {
      reportDate = new Date(reportDate).toISOString().split("T")[0];
    }

    // Convert amounts to numbers if they're strings
    const totalRevenue = typeof data.totalRevenue === "string" 
      ? parseFloat(data.totalRevenue.replace(/[^0-9.-]+/g, ""))
      : data.totalRevenue;
      
    const roomRevenue = typeof data.roomRevenue === "string"
      ? parseFloat(data.roomRevenue.replace(/[^0-9.-]+/g, ""))
      : data.roomRevenue;
      
    const fnbRevenue = typeof data.fnbRevenue === "string"
      ? parseFloat(data.fnbRevenue.replace(/[^0-9.-]+/g, ""))
      : data.fnbRevenue;
      
    const otherRevenue = typeof data.otherRevenue === "string"
      ? parseFloat(data.otherRevenue.replace(/[^0-9.-]+/g, ""))
      : data.otherRevenue;
      
    const operationalExpenses = typeof data.operationalExpenses === "string"
      ? parseFloat(data.operationalExpenses.replace(/[^0-9.-]+/g, ""))
      : data.operationalExpenses;
      
    const netProfit = typeof data.netProfit === "string"
      ? parseFloat(data.netProfit.replace(/[^0-9.-]+/g, ""))
      : data.netProfit;

    // Insert into financial_reports table
    const { error } = await supabase.from("financial_reports").insert({
      report_type: "Monthly",
      report_date: reportDate,
      total_revenue: totalRevenue,
      room_revenue: roomRevenue,
      fnb_revenue: fnbRevenue,
      other_revenue: otherRevenue,
      operational_expenses: operationalExpenses,
      net_profit: netProfit,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    await logProcessingStep(requestId, fileId, "info", "Financial report data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert financial report data", {
      error: error.message
    });
    throw error;
  }
}

// Insert occupancy report data
async function insertOccupancyReport(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let reportDate = data.date;
    if (typeof reportDate === "string") {
      reportDate = new Date(reportDate).toISOString().split("T")[0];
    }

    // Convert values to numbers if they're strings
    const totalRoomsAvailable = typeof data.totalRoomsAvailable === "string" 
      ? parseInt(data.totalRoomsAvailable.replace(/[^0-9.-]+/g, ""), 10)
      : data.totalRoomsAvailable;
      
    const totalRoomsOccupied = typeof data.totalRoomsOccupied === "string"
      ? parseInt(data.totalRoomsOccupied.replace(/[^0-9.-]+/g, ""), 10)
      : data.totalRoomsOccupied;
      
    const occupancyRate = typeof data.occupancyRate === "string"
      ? parseFloat(data.occupancyRate.replace(/[^0-9.-]+/g, ""))
      : data.occupancyRate;
      
    const averageDailyRate = typeof data.averageDailyRate === "string"
      ? parseFloat(data.averageDailyRate.replace(/[^0-9.-]+/g, ""))
      : data.averageDailyRate;
      
    const revenuePerAvailableRoom = typeof data.revenuePerAvailableRoom === "string"
      ? parseFloat(data.revenuePerAvailableRoom.replace(/[^0-9.-]+/g, ""))
      : data.revenuePerAvailableRoom;
      
    const averageLengthOfStay = typeof data.averageLengthOfStay === "string"
      ? parseFloat(data.averageLengthOfStay.replace(/[^0-9.-]+/g, ""))
      : data.averageLengthOfStay;

    // Insert into occupancy_reports table
    const { error } = await supabase.from("occupancy_reports").insert({
      date: reportDate,
      total_rooms_available: totalRoomsAvailable,
      total_rooms_occupied: totalRoomsOccupied,
      occupancy_rate: occupancyRate,
      average_daily_rate: averageDailyRate,
      revenue_per_available_room: revenuePerAvailableRoom,
      average_length_of_stay: averageLengthOfStay,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    await logProcessingStep(requestId, fileId, "info", "Occupancy report data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert occupancy report data", {
      error: error.message
    });
    throw error;
  }
}

// Insert city ledger data
async function insertCityLedger(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let ledgerDate = data.ledgerDate;
    if (typeof ledgerDate === "string") {
      ledgerDate = new Date(ledgerDate).toISOString().split("T")[0];
    }

    // Convert amounts to numbers if they're strings
    const openingBalance = typeof data.openingBalance === "string" 
      ? parseFloat(data.openingBalance.replace(/[^0-9.-]+/g, ""))
      : data.openingBalance || 0;
      
    const payments = typeof data.payments === "string"
      ? parseFloat(data.payments.replace(/[^0-9.-]+/g, ""))
      : data.payments || 0;
      
    const charges = typeof data.charges === "string"
      ? parseFloat(data.charges.replace(/[^0-9.-]+/g, ""))
      : data.charges || 0;
      
    const closingBalance = typeof data.closingBalance === "string"
      ? parseFloat(data.closingBalance.replace(/[^0-9.-]+/g, ""))
      : data.closingBalance || 0;

    // Insert into city_ledger table
    const { error } = await supabase.from("city_ledger").insert({
      account_name: data.accountName,
      reference_number: data.referenceNumber,
      ledger_date: ledgerDate,
      opening_balance: openingBalance,
      payments: payments,
      charges: charges,
      closing_balance: closingBalance,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    await logProcessingStep(requestId, fileId, "info", "City ledger data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert city ledger data", {
      error: error.message
    });
    throw error;
  }
}

// Insert night audit data
async function insertNightAudit(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let auditDate = data.auditDate;
    if (typeof auditDate === "string") {
      auditDate = new Date(auditDate).toISOString().split("T")[0];
    }

    // Convert amounts to numbers if they're strings
    const revenue = typeof data.revenue === "string" 
      ? parseFloat(data.revenue.replace(/[^0-9.-]+/g, ""))
      : data.revenue || 0;
      
    const taxes = typeof data.taxes === "string"
      ? parseFloat(data.taxes.replace(/[^0-9.-]+/g, ""))
      : data.taxes || 0;
      
    const charges = typeof data.charges === "string"
      ? parseFloat(data.charges.replace(/[^0-9.-]+/g, ""))
      : data.charges || 0;
      
    const balance = typeof data.balance === "string"
      ? parseFloat(data.balance.replace(/[^0-9.-]+/g, ""))
      : data.balance || 0;

    // Insert into night_audit_details table
    const { error } = await supabase.from("night_audit_details").insert({
      audit_date: auditDate,
      revenue: revenue,
      taxes: taxes,
      charges: charges,
      balance: balance,
      notes: data.notes,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    // If room entries exist, process them
    if (data.roomEntries && Array.isArray(data.roomEntries)) {
      await logProcessingStep(requestId, fileId, "info", `Processing ${data.roomEntries.length} room entries`);
      
      // For simplicity, we're not handling room entries in this example
      // In a real implementation, you would create room records here
    }

    await logProcessingStep(requestId, fileId, "info", "Night audit data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert night audit data", {
      error: error.message
    });
    throw error;
  }
}

// Insert no-show report data
async function insertNoShowReport(
  data: any,
  hotelId: string,
  requestId: string,
  fileId: string
) {
  try {
    // Convert string dates to proper format if needed
    let reportDate = data.reportDate;
    if (typeof reportDate === "string") {
      reportDate = new Date(reportDate).toISOString().split("T")[0];
    }

    // Convert values to numbers if they're strings
    const numberOfNoShows = typeof data.numberOfNoShows === "string" 
      ? parseInt(data.numberOfNoShows.replace(/[^0-9.-]+/g, ""), 10)
      : data.numberOfNoShows || 0;
      
    const potentialRevenueLoss = typeof data.potentialRevenueLoss === "string"
      ? parseFloat(data.potentialRevenueLoss.replace(/[^0-9.-]+/g, ""))
      : data.potentialRevenueLoss || 0;

    // Insert into no_show_reports table
    const { error } = await supabase.from("no_show_reports").insert({
      report_date: reportDate,
      number_of_no_shows: numberOfNoShows,
      potential_revenue_loss: potentialRevenueLoss,
      hotel_id: hotelId
    });

    if (error) {
      throw error;
    }

    await logProcessingStep(requestId, fileId, "info", "No-show report data inserted");
  } catch (error) {
    await logProcessingStep(requestId, fileId, "error", "Failed to insert no-show report data", {
      error: error.message
    });
    throw error;
  }
}
