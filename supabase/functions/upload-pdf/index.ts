
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to classify the PDF document type
function classifyDocumentType(content: string): string {
  // This is a simplified classification based on keywords
  // In a real implementation, you would use more sophisticated NLP techniques
  
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('expense voucher') || lowerContent.includes('expense report')) {
    return 'expense_voucher';
  } else if (lowerContent.includes('monthly statistics') || lowerContent.includes('yearly statistics')) {
    return 'financial_summary';
  } else if (lowerContent.includes('no-show') || lowerContent.includes('no show')) {
    return 'no_show_report';
  } else if (lowerContent.includes('city ledger')) {
    return 'city_ledger';
  } else if (lowerContent.includes('night audit')) {
    return 'night_audit';
  } else if (lowerContent.includes('front desk activity') || lowerContent.includes('guest stay')) {
    return 'guest_stay';
  } else if (lowerContent.includes('occupancy report') || lowerContent.includes('occupancy rate')) {
    return 'occupancy_report';
  } else {
    return 'unknown';
  }
}

// Extract relevant data based on document type (simplified mock implementation)
function extractDataByType(content: string, docType: string): any {
  // In a real implementation, you would use more sophisticated extraction techniques
  // like regex patterns, OCR, or NLP models tailored to each document type
  
  // This function returns mock data based on document type
  // It should be replaced with actual extraction logic for production use
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  switch (docType) {
    case 'expense_voucher':
      return {
        expense_type: 'Operating Expense',
        expense_amount: Math.floor(Math.random() * 10000),
        taxes_included: Math.floor(Math.random() * 1000),
        remarks: 'Extracted from PDF'
      };
      
    case 'financial_summary':
      return {
        report_type: Math.random() > 0.5 ? 'Monthly' : 'Yearly',
        total_revenue: Math.floor(Math.random() * 1000000),
        room_revenue: Math.floor(Math.random() * 500000),
        fnb_revenue: Math.floor(Math.random() * 300000),
        other_revenue: Math.floor(Math.random() * 200000),
        operational_expenses: Math.floor(Math.random() * 600000)
      };
      
    case 'no_show_report':
      return {
        number_of_no_shows: Math.floor(Math.random() * 10),
        potential_revenue_loss: Math.floor(Math.random() * 50000)
      };
      
    case 'city_ledger':
      return {
        account_name: `Account-${Math.floor(Math.random() * 10000)}`,
        opening_balance: Math.floor(Math.random() * 50000),
        charges: Math.floor(Math.random() * 5000),
        payments: Math.floor(Math.random() * 8000),
        closing_balance: Math.floor(Math.random() * 50000),
        reference_number: `REF-${Math.floor(Math.random() * 100000)}`
      };
      
    case 'night_audit':
      return {
        revenue: Math.floor(Math.random() * 50000),
        taxes: Math.floor(Math.random() * 5000),
        charges: Math.floor(Math.random() * 3000),
        balance: Math.floor(Math.random() * 2000),
        notes: 'Extracted from night audit report'
      };
      
    case 'guest_stay':
      return {
        guest_name: `Guest-${Math.floor(Math.random() * 1000)}`,
        arrival_date: currentDate,
        departure_date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
        nights: 3,
        number_of_guests: Math.floor(Math.random() * 4) + 1,
        total_amount: Math.floor(Math.random() * 30000),
        amount_paid: Math.floor(Math.random() * 30000),
        booking_source: Math.random() > 0.5 ? 'Direct' : 'OTA',
        voucher_number: `V-${Math.floor(Math.random() * 10000)}`
      };
      
    case 'occupancy_report':
      return {
        rooms_available: Math.floor(Math.random() * 100) + 50,
        rooms_occupied: Math.floor(Math.random() * 50) + 30,
        occupancy_rate: (Math.random() * 40 + 60).toFixed(2),
        average_daily_rate: (Math.random() * 10000 + 5000).toFixed(2),
        revpar: (Math.random() * 8000 + 3000).toFixed(2),
        average_length_of_stay: Math.floor(Math.random() * 5) + 1
      };
      
    default:
      return {
        message: 'Unknown document type, could not extract specific data'
      };
  }
}

// Function to save extracted data to the appropriate table
async function saveDataToTable(supabase: any, hotelId: string, docType: string, extractedData: any, reportDate: string): Promise<any> {
  try {
    let result;
    
    switch (docType) {
      case 'expense_voucher':
        result = await supabase.from('expense_vouchers').insert({
          hotel_id: hotelId,
          expense_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      case 'financial_summary':
        result = await supabase.from('financial_summaries').insert({
          hotel_id: hotelId,
          report_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      case 'no_show_report':
        result = await supabase.from('no_show_reports').insert({
          hotel_id: hotelId,
          report_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      case 'city_ledger':
        result = await supabase.from('city_ledger').insert({
          hotel_id: hotelId,
          ledger_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      case 'night_audit':
        result = await supabase.from('night_audit_details').insert({
          hotel_id: hotelId,
          audit_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      case 'guest_stay':
        // For guest stays, we need to create a room first
        const roomResult = await supabase.from('room_details').insert({
          hotel_id: hotelId,
          room_number: `${Math.floor(Math.random() * 500) + 100}`,
          room_type: Math.random() > 0.5 ? 'Standard' : 'Deluxe',
          rate_type: Math.random() > 0.5 ? 'Room Only' : 'Breakfast Included',
          standard_rate: Math.floor(Math.random() * 10000) + 5000
        }).select().single();
        
        if (roomResult.error) {
          throw new Error(`Error creating room: ${roomResult.error.message}`);
        }
        
        result = await supabase.from('guest_stays').insert({
          room_id: roomResult.data.room_id,
          ...extractedData
        }).select().single();
        break;
        
      case 'occupancy_report':
        result = await supabase.from('occupancy_reports').insert({
          hotel_id: hotelId,
          report_date: reportDate,
          ...extractedData
        }).select().single();
        break;
        
      default:
        // For unknown document types, just return the extracted data without saving
        return { data: extractedData, docType: 'unknown' };
    }
    
    if (result.error) {
      throw new Error(`Error inserting data: ${result.error.message}`);
    }
    
    return { data: result.data, docType };
    
  } catch (error) {
    console.error(`Error saving data to table (${docType}):`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { fileId, filePath } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the file info
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file data:', fileError);
      throw new Error(`Failed to fetch file data: ${fileError.message}`);
    }

    // For demonstration purposes, we'll use mock text content
    // In a real implementation, you would download the PDF and extract its content
    const mockPdfContent = `This is a sample ${[
      'expense voucher', 'monthly statistics', 'no-show report', 
      'city ledger', 'night audit', 'front desk activity', 'occupancy report'
    ][Math.floor(Math.random() * 7)]} document for Hotel XYZ.`;
    
    // Classify the document type
    const documentType = classifyDocumentType(mockPdfContent);
    console.log(`Document classified as: ${documentType}`);
    
    // Extract data based on document type
    const extractedData = extractDataByType(mockPdfContent, documentType);
    console.log('Extracted data:', extractedData);
    
    // Get a default hotel ID for demonstration
    // In a real implementation, you would determine this from the document or user selection
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('hotel_id')
      .limit(1);
      
    if (hotelsError || !hotels || hotels.length === 0) {
      // If no hotels exist, create a sample one
      const { data: newHotel, error: newHotelError } = await supabase
        .from('hotels')
        .insert({
          hotel_name: 'Sample Hotel',
          location: 'Sample Location'
        })
        .select()
        .single();
        
      if (newHotelError) {
        throw new Error(`Failed to create sample hotel: ${newHotelError.message}`);
      }
      
      var hotelId = newHotel.hotel_id;
    } else {
      var hotelId = hotels[0].hotel_id;
    }
    
    // Current date for report date
    const reportDate = new Date().toISOString().split('T')[0];
    
    // Save the extracted data to the appropriate table
    const savedResult = await saveDataToTable(supabase, hotelId, documentType, extractedData, reportDate);
    
    // Prepare the response data with more detailed information
    const processingResult = {
      document_type: documentType,
      extracted_data: extractedData,
      saved_data: savedResult.data,
      hotel_id: hotelId,
      report_date: reportDate
    };
    
    // Update the file record to mark it as processed
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processed: true,
        extracted_data: processingResult
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file:', updateError);
      throw new Error(`Failed to update file processing status: ${updateError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDF processed successfully',
        data: processingResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process PDF',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
