
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, filePath } = await req.json();
    
    console.log(`Processing file ID: ${fileId}, path: ${filePath}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get file info from database
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError) {
      console.error('Error fetching file data:', fileError);
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Download file from storage for processing
    const { data: fileContent, error: downloadError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);
      
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`File downloaded successfully, size: ${fileContent.size} bytes`);
    
    // Mock document classification and data extraction
    // In a production environment, this would be replaced with actual OCR and text analysis
    const documentTypes = [
      'Expense Voucher', 
      'Monthly Statistics', 
      'Occupancy Report', 
      'City Ledger', 
      'Night Audit', 
      'No-show Report'
    ];
    
    // Determine document type based on filename patterns
    // This is a simplified mock implementation
    const filename = fileData.filename.toLowerCase();
    let documentType = 'Unknown';
    
    if (filename.includes('expense') || filename.includes('voucher')) {
      documentType = 'Expense Voucher';
    } else if (filename.includes('monthly') || filename.includes('statistics')) {
      documentType = 'Monthly Statistics';
    } else if (filename.includes('occupancy')) {
      documentType = 'Occupancy Report';
    } else if (filename.includes('city') || filename.includes('ledger')) {
      documentType = 'City Ledger';
    } else if (filename.includes('audit')) {
      documentType = 'Night Audit';
    } else if (filename.includes('no-show') || filename.includes('noshow')) {
      documentType = 'No-show Report';
    } else {
      // Random classification for testing if no pattern matched
      documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    }
    
    console.log(`Document classified as: ${documentType}`);
    
    // Extract data based on document type
    // This is mock data - in a real implementation, you'd use OCR and NLP to extract actual data
    let extractedData: any = {
      documentType: documentType,
      processingDate: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 30) + 70, // Mock confidence score between 70-99%
    };
    
    // Generate different mock data fields based on document type
    const mockHotelId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Random UUID as placeholder
    
    switch (documentType) {
      case 'Expense Voucher':
        extractedData = {
          ...extractedData,
          hotelId: mockHotelId,
          expenseDate: new Date().toISOString().split('T')[0],
          expenseType: ['Utilities', 'Maintenance', 'Food & Beverage', 'Housekeeping'][Math.floor(Math.random() * 4)],
          expenseAmount: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
          taxesIncluded: parseFloat((Math.random() * 100).toFixed(2)),
          remarks: 'Automatically extracted from PDF'
        };
        
        // Store in expense_vouchers table
        const { data: expenseData, error: expenseError } = await supabase
          .from('expense_vouchers')
          .insert({
            hotel_id: extractedData.hotelId,
            expense_date: extractedData.expenseDate,
            expense_type: extractedData.expenseType,
            expense_amount: extractedData.expenseAmount,
            taxes_included: extractedData.taxesIncluded,
            remarks: extractedData.remarks
          })
          .select();
          
        if (expenseError) {
          console.error('Error storing expense data:', expenseError);
        } else {
          extractedData.dbRecordId = expenseData[0].voucher_id;
          console.log('Expense voucher data stored successfully');
        }
        break;
        
      case 'Occupancy Report':
        const totalRooms = Math.floor(Math.random() * 50) + 50;
        const occupiedRooms = Math.floor(Math.random() * totalRooms);
        const occupancyRate = parseFloat((occupiedRooms / totalRooms * 100).toFixed(1));
        
        extractedData = {
          ...extractedData,
          reportDate: new Date().toISOString().split('T')[0],
          totalRooms: totalRooms,
          occupiedRooms: occupiedRooms,
          occupancyRate: occupancyRate,
          averageRate: parseFloat((Math.random() * 200 + 100).toFixed(2)),
          revPAR: parseFloat((Math.random() * 150 + 50).toFixed(2))
        };
        
        // We would typically store this data in appropriate tables
        console.log('Occupancy report data processed');
        break;
        
      case 'City Ledger':
        extractedData = {
          ...extractedData,
          hotelId: mockHotelId,
          ledgerDate: new Date().toISOString().split('T')[0],
          accountName: ['Corporate Account 1', 'Travel Agency XYZ', 'Airline ABC'][Math.floor(Math.random() * 3)],
          openingBalance: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
          charges: parseFloat((Math.random() * 2000).toFixed(2)),
          payments: parseFloat((Math.random() * 3000).toFixed(2)),
          referenceNumber: `REF-${Math.floor(Math.random() * 10000)}`
        };
        
        extractedData.closingBalance = parseFloat((extractedData.openingBalance + extractedData.charges - extractedData.payments).toFixed(2));
        
        // Store in city_ledger table
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('city_ledger')
          .insert({
            hotel_id: extractedData.hotelId,
            ledger_date: extractedData.ledgerDate,
            account_name: extractedData.accountName,
            opening_balance: extractedData.openingBalance,
            charges: extractedData.charges,
            payments: extractedData.payments,
            closing_balance: extractedData.closingBalance,
            reference_number: extractedData.referenceNumber
          })
          .select();
          
        if (ledgerError) {
          console.error('Error storing ledger data:', ledgerError);
        } else {
          extractedData.dbRecordId = ledgerData[0].ledger_id;
          console.log('City ledger data stored successfully');
        }
        break;
        
      case 'Night Audit':
        extractedData = {
          ...extractedData,
          hotelId: mockHotelId,
          auditDate: new Date().toISOString().split('T')[0],
          totalRevenue: parseFloat((Math.random() * 10000 + 5000).toFixed(2)),
          roomRevenue: parseFloat((Math.random() * 8000 + 4000).toFixed(2)),
          fbRevenue: parseFloat((Math.random() * 2000 + 1000).toFixed(2)),
          otherRevenue: parseFloat((Math.random() * 1000).toFixed(2)),
          occupancyPercent: parseFloat((Math.random() * 40 + 60).toFixed(1)),
          adr: parseFloat((Math.random() * 100 + 150).toFixed(2))
        };
        
        // We would typically store detailed audit data in the night_audit_details table
        console.log('Night audit data processed');
        break;
        
      case 'No-show Report':
        extractedData = {
          ...extractedData,
          hotelId: mockHotelId,
          reportDate: new Date().toISOString().split('T')[0],
          numberOfNoShows: Math.floor(Math.random() * 10) + 1,
          potentialRevenueLoss: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
          bookingSources: ['OTA', 'Direct', 'Travel Agent', 'Corporate']
            .slice(0, Math.floor(Math.random() * 3) + 1)
        };
        
        // Store in no_show_reports table
        const { data: noShowData, error: noShowError } = await supabase
          .from('no_show_reports')
          .insert({
            hotel_id: extractedData.hotelId,
            report_date: extractedData.reportDate,
            number_of_no_shows: extractedData.numberOfNoShows,
            potential_revenue_loss: extractedData.potentialRevenueLoss
          })
          .select();
          
        if (noShowError) {
          console.error('Error storing no-show data:', noShowError);
        } else {
          extractedData.dbRecordId = noShowData[0].no_show_id;
          console.log('No-show report data stored successfully');
        }
        break;
        
      case 'Monthly Statistics':
        extractedData = {
          ...extractedData,
          reportMonth: new Date().toISOString().substring(0, 7),
          occupancyRate: parseFloat((Math.random() * 30 + 70).toFixed(1)),
          averageDailyRate: parseFloat((Math.random() * 100 + 150).toFixed(2)),
          revPAR: parseFloat((Math.random() * 80 + 120).toFixed(2)),
          totalRevenue: parseFloat((Math.random() * 300000 + 200000).toFixed(2)),
          revenueBreakdown: {
            rooms: parseFloat((Math.random() * 0.2 + 0.6).toFixed(2)),
            foodAndBeverage: parseFloat((Math.random() * 0.1 + 0.2).toFixed(2)),
            other: parseFloat((Math.random() * 0.1).toFixed(2))
          }
        };
        
        console.log('Monthly statistics data processed');
        break;
        
      default:
        extractedData.genericData = {
          textSample: 'Sample extracted text from the document',
          keyValuePairs: [
            { key: 'Date', value: new Date().toISOString().split('T')[0] },
            { key: 'Total', value: `$${(Math.random() * 1000 + 100).toFixed(2)}` },
            { key: 'Reference', value: `REF-${Math.floor(Math.random() * 10000)}` }
          ]
        };
    }
    
    // Update the file record with the extraction results
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({
        processed: true,
        extracted_data: extractedData,
        document_type: documentType,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error('Error updating file record:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update file record', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('File processing completed successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'File processed successfully',
        documentType,
        extractedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Unexpected error during processing:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
