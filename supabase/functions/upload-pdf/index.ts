
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a sanitized filename
    const fileName = file.name;
    const fileExt = fileName.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('pdf_files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage', details: storageError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdf_files')
      .getPublicUrl(filePath);

    // TODO: In a real implementation, we would extract data from the PDF here
    // For now, we'll simulate extraction with mock data
    const mockExtractedData = generateMockExtractedData(fileName);

    // Insert file metadata into database
    const { data: dbData, error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        filename: fileName,
        file_path: filePath,
        file_type: file.type,
        extracted_data: mockExtractedData,
        processed: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: dbData.id,
        filePath: filePath,
        publicUrl: publicUrl,
        extractedData: mockExtractedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to generate mock data based on filename
function generateMockExtractedData(filename: string) {
  const isFinancial = /financial|expense|revenue|budget|statement|report/i.test(filename);
  const isOccupancy = /occupancy|booking|reservation|guest|room|night|audit/i.test(filename);
  
  let fileType = 'Unrecognized Document';
  let date = new Date().toISOString().split('T')[0]; // Today's date
  let hotelName = 'Grand Plaza Hotel';
  let metrics = {};
  let records = [];
  
  if (isFinancial) {
    fileType = 'Financial Report';
    metrics = {
      totalRevenue: { value: '$438,291.00', selected: true },
      roomRevenue: { value: '$325,180.00', selected: true },
      fnbRevenue: { value: '$98,753.00', selected: true },
      otherRevenue: { value: '$14,358.00', selected: true },
      operationalExpenses: { value: '$287,654.00', selected: true },
      netProfit: { value: '$150,637.00', selected: true },
    };
    
    records = [
      { _selected: true, category: 'Room Revenue', amount: '$325,180.00', percentage: '74.2%' },
      { _selected: true, category: 'F&B Revenue', amount: '$98,753.00', percentage: '22.5%' },
      { _selected: true, category: 'Other Revenue', amount: '$14,358.00', percentage: '3.3%' },
      { _selected: true, category: 'Staff Costs', amount: '$145,234.00', percentage: '33.1%' },
      { _selected: true, category: 'Utilities', amount: '$42,580.00', percentage: '9.7%' },
      { _selected: true, category: 'Marketing', amount: '$28,750.00', percentage: '6.6%' },
      { _selected: true, category: 'Maintenance', amount: '$31,090.00', percentage: '7.1%' },
      { _selected: true, category: 'Other Expenses', amount: '$40,000.00', percentage: '9.1%' },
    ];
  } else if (isOccupancy) {
    fileType = 'Occupancy Report';
    metrics = {
      occupancyRate: { value: '78.5%', selected: true },
      averageDailyRate: { value: '$245.30', selected: true },
      revenuePerAvailableRoom: { value: '$192.56', selected: true },
      totalRoomsAvailable: { value: '1,500', selected: true },
      totalRoomsOccupied: { value: '1,178', selected: true },
      averageLengthOfStay: { value: '2.3 nights', selected: true },
    };
    
    records = [
      { _selected: true, date: '2023-01-01', occupancy: '82.3%', ADR: '$267.45', RevPAR: '$220.11' },
      { _selected: true, date: '2023-01-02', occupancy: '76.8%', ADR: '$238.90', RevPAR: '$183.48' },
      { _selected: true, date: '2023-01-03', occupancy: '71.2%', ADR: '$229.75', RevPAR: '$163.58' },
      { _selected: true, date: '2023-01-04', occupancy: '75.9%', ADR: '$241.20', RevPAR: '$183.07' },
      { _selected: true, date: '2023-01-05', occupancy: '84.6%', ADR: '$252.60', RevPAR: '$213.70' },
      { _selected: true, date: '2023-01-06', occupancy: '92.1%', ADR: '$278.90', RevPAR: '$256.97' },
      { _selected: true, date: '2023-01-07', occupancy: '86.5%', ADR: '$272.30', RevPAR: '$235.54' },
    ];
  }
  
  return {
    fileType,
    date,
    hotelName,
    metrics,
    records
  };
}
