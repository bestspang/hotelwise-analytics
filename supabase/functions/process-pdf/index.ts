
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

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
    // Get the file ID and path from the request body
    const { fileId, filePath, filename } = await req.json();
    console.log(`Processing file: ${filename} (ID: ${fileId}, Path: ${filePath})`);

    if (!fileId || !filePath) {
      throw new Error('File ID and path are required');
    }

    // Initialize Supabase client using service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from Storage
    console.log(`Downloading file from path: ${filePath}`);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('pdf_files')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Determine document type based on file name pattern
    let documentType = 'Unknown';
    if (filename.toLowerCase().includes('cityledger')) {
      documentType = 'City Ledger';
    } else if (filename.toLowerCase().includes('expense')) {
      documentType = 'Expense Voucher';
    } else if (filename.toLowerCase().includes('monthly') || filename.toLowerCase().includes('statistics')) {
      documentType = 'Monthly Statistics';
    } else if (filename.toLowerCase().includes('occupancy')) {
      documentType = 'Occupancy Report';
    } else if (filename.toLowerCase().includes('night') || filename.toLowerCase().includes('audit')) {
      documentType = 'Night Audit';
    } else if (filename.toLowerCase().includes('noshow')) {
      documentType = 'No-show Report';
    }

    console.log(`Detected document type: ${documentType}`);
    
    // Simulate AI processing with mock data based on document type
    let extractedData: any = {
      documentType,
      processingDate: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 10) + 90, // 90-99% confidence
      dbRecordId: fileId,
    };

    // Add type-specific mock data
    switch (documentType) {
      case 'City Ledger':
        extractedData = {
          ...extractedData,
          accountName: 'Luxury Tours & Travel Co.',
          referenceNumber: 'CL-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          openingBalance: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
          closingBalance: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
          charges: parseFloat((Math.random() * 3000 + 500).toFixed(2)),
          payments: parseFloat((Math.random() * 3000 + 500).toFixed(2)),
        };
        break;
      case 'Expense Voucher':
        extractedData = {
          ...extractedData,
          expenseAmount: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
          expenseType: ['Maintenance', 'Food & Beverage', 'Utilities', 'Payroll', 'Marketing'][Math.floor(Math.random() * 5)],
          expenseDate: new Date().toISOString().split('T')[0],
          taxesIncluded: parseFloat((Math.random() * 100).toFixed(2)),
          vendorName: ['ABC Supplies', 'XYZ Services', 'Premium Foods', 'Metro Utilities', 'Global Marketing'][Math.floor(Math.random() * 5)],
        };
        break;
      case 'Monthly Statistics':
        extractedData = {
          ...extractedData,
          reportMonth: new Date().toISOString().substr(0, 7),
          occupancyRate: parseFloat((Math.random() * 30 + 60).toFixed(1)),
          averageDailyRate: parseFloat((Math.random() * 100 + 150).toFixed(2)),
          revPAR: parseFloat((Math.random() * 80 + 100).toFixed(2)),
          totalRevenue: parseFloat((Math.random() * 500000 + 300000).toFixed(2)),
          revenueBreakdown: {
            rooms: parseFloat((Math.random() * 0.2 + 0.6).toFixed(2)),
            foodAndBeverage: parseFloat((Math.random() * 0.1 + 0.2).toFixed(2)),
            other: parseFloat((Math.random() * 0.1).toFixed(2)),
          },
        };
        break;
      case 'Occupancy Report':
        extractedData = {
          ...extractedData,
          occupancyRate: parseFloat((Math.random() * 30 + 60).toFixed(1)),
          averageRate: parseFloat((Math.random() * 100 + 150).toFixed(2)),
          revPAR: parseFloat((Math.random() * 80 + 100).toFixed(2)),
          totalRooms: 100 + Math.floor(Math.random() * 100),
          occupiedRooms: 60 + Math.floor(Math.random() * 40),
          reportDate: new Date().toISOString().split('T')[0],
        };
        break;
      case 'Night Audit':
        extractedData = {
          ...extractedData,
          totalRevenue: parseFloat((Math.random() * 20000 + 10000).toFixed(2)),
          roomRevenue: parseFloat((Math.random() * 15000 + 8000).toFixed(2)),
          fbRevenue: parseFloat((Math.random() * 5000 + 2000).toFixed(2)),
          occupancyPercent: parseFloat((Math.random() * 30 + 60).toFixed(1)),
          adr: parseFloat((Math.random() * 100 + 150).toFixed(2)),
          auditDate: new Date().toISOString().split('T')[0],
        };
        break;
      case 'No-show Report':
        extractedData = {
          ...extractedData,
          numberOfNoShows: Math.floor(Math.random() * 10) + 1,
          potentialRevenueLoss: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
          reportDate: new Date().toISOString().split('T')[0],
          bookingSources: ['Direct Website', 'OTA', 'Travel Agent', 'Phone Reservation'].slice(0, Math.floor(Math.random() * 3) + 1),
        };
        break;
      default:
        extractedData.genericData = {
          text: "Sample extracted text from the document",
          date: new Date().toISOString().split('T')[0],
          amount: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
        };
    }

    console.log('Generated mock extracted data');

    // Update the file record with the extracted data
    const { error: updateError } = await supabaseAdmin
      .from('uploaded_files')
      .update({ 
        processed: true, 
        extracted_data: extractedData,
        document_type: documentType
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file record:', updateError);
      throw new Error(`Failed to update file record: ${updateError.message}`);
    }

    console.log('Successfully processed file and updated record');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File processed successfully',
        documentType,
        extractedData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in process-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});
