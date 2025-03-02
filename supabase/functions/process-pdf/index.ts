
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS');
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const { fileId, filePath, filename, isReprocessing = false, notifyOnCompletion = false } = await req.json();
    
    console.log(`Processing file: ${filename}, ID: ${fileId}, Path: ${filePath}`);
    console.log(`isReprocessing: ${isReprocessing}, notifyOnCompletion: ${notifyOnCompletion}`);

    if (!fileId || !filePath) {
      console.error('Missing required parameters: fileId or filePath');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Download the file from Storage for processing
    console.log(`Downloading file from path: ${filePath}`);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdf_files')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('File downloaded successfully');

    // 2. Detect document type (simplified example - in production, use AI to detect type)
    // For now, we'll infer from filename
    let documentType = 'Unknown';
    
    if (filename.toLowerCase().includes('cityledger')) {
      documentType = 'City Ledger';
    } else if (filename.toLowerCase().includes('expense')) {
      documentType = 'Expense Voucher';
    } else if (filename.toLowerCase().includes('statistics')) {
      documentType = 'Monthly Statistics';
    } else if (filename.toLowerCase().includes('occupancy')) {
      documentType = 'Occupancy Report';
    } else if (filename.toLowerCase().includes('noshow')) {
      documentType = 'No-show Report';
    }
    
    console.log(`Detected document type: ${documentType}`);

    // 3. Simulate AI extraction (in production, this would call OpenAI or similar)
    console.log('Extracting data from PDF...');
    
    // In a real implementation, we might use already mapped fields from data_mappings
    // For this example, we're using simulated data
    const extractedData = simulateDataExtraction(documentType, filename);
    
    console.log('Data extraction complete');

    // 4. Update the database with the extracted data
    console.log('Updating database record with extracted data');
    const { error: updateError } = await supabase
      .from('uploaded_files')
      .update({ 
        processed: true,
        document_type: documentType,
        extracted_data: extractedData
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating database:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update database', details: updateError }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Database updated successfully');

    // 5. Send notification if requested (would integrate with email/notification system)
    if (notifyOnCompletion) {
      console.log('Notification would be sent here in production');
      // In production: sendNotification(fileId, filename, extractedData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'File processed successfully',
        documentType,
        fileId
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Unexpected error in process-pdf edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace available'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Helper function to simulate AI extraction
function simulateDataExtraction(documentType: string, filename: string) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  switch(documentType) {
    case 'City Ledger':
      return {
        documentType: 'City Ledger',
        reportDate: currentDate,
        totalOutstanding: 158794.23,
        accountsWithBalance: 47,
        highestBalance: {
          account: "Corporate Travel Inc.",
          amount: 34567.89
        },
        recentTransactions: [
          { date: currentDate, account: "Acme Corp", amount: 12500.00, type: "Payment" },
          { date: currentDate, account: "Global Tours", amount: 7890.50, type: "Charge" }
        ]
      };
    
    case 'Expense Voucher':
      return {
        documentType: 'Expense Voucher',
        voucherNumber: `V${Math.floor(Math.random() * 10000)}`,
        issueDate: currentDate,
        amount: Math.floor(Math.random() * 5000) + 500,
        department: "Food & Beverage",
        approvedBy: "Finance Manager",
        description: "Monthly supplies procurement"
      };
    
    case 'Monthly Statistics':
      return {
        documentType: 'Monthly Statistics',
        reportPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        occupancyRate: Math.floor(Math.random() * 30) + 60,
        averageDailyRate: Math.floor(Math.random() * 100) + 150,
        revPAR: Math.floor(Math.random() * 100) + 100,
        totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
        yoyGrowth: (Math.random() * 20 - 5).toFixed(2)
      };
    
    case 'Occupancy Report':
      return {
        documentType: 'Occupancy Report',
        reportDate: currentDate,
        totalRooms: 350,
        occupiedRooms: Math.floor(Math.random() * 100) + 200,
        occupancyPercentage: Math.floor(Math.random() * 30) + 60,
        reservationBreakdown: {
          leisure: Math.floor(Math.random() * 40) + 30,
          business: Math.floor(Math.random() * 40) + 20,
          groups: Math.floor(Math.random() * 20) + 10
        }
      };
    
    case 'No-show Report':
      return {
        documentType: 'No-show Report',
        reportDate: currentDate,
        totalNoShows: Math.floor(Math.random() * 10) + 1,
        totalLostRevenue: Math.floor(Math.random() * 2000) + 500,
        noShowBreakdown: [
          { reservationType: "Online", count: Math.floor(Math.random() * 5) + 1 },
          { reservationType: "Travel Agent", count: Math.floor(Math.random() * 3) },
          { reservationType: "Direct", count: Math.floor(Math.random() * 3) }
        ]
      };
    
    default:
      return {
        documentType: 'Unknown',
        filename: filename,
        processingTimestamp: new Date().toISOString(),
        note: "Document type could not be determined. Manual review required."
      };
  }
}
