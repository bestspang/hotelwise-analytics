
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { fileId, filePath } = await req.json();
    
    if (!fileId || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    
    // Here we would typically download the file and process it with OCR/NLP
    // For now, we'll simulate successful processing with mock data
    
    // Generate mock extracted data
    const mockData = generateMockData();
    
    // Update the file record with the extracted data
    const { error: updateError } = await supabaseClient
      .from('uploaded_files')
      .update({ 
        extracted_data: mockData,
        processed: true 
      })
      .eq('id', fileId);
      
    if (updateError) {
      throw updateError;
    }
    
    return new Response(
      JSON.stringify({ success: true, data: mockData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process the PDF file" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateMockData() {
  // Generate realistic financial and occupancy data
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  return {
    financial: {
      date: dateStr,
      total_revenue: Math.floor(Math.random() * 50000) + 10000,
      room_revenue: Math.floor(Math.random() * 30000) + 8000,
      fnb_revenue: Math.floor(Math.random() * 10000) + 2000,
      other_revenue: Math.floor(Math.random() * 5000),
      expenses: Math.floor(Math.random() * 20000) + 5000,
      net_profit: Math.floor(Math.random() * 20000) + 2000
    },
    occupancy: {
      date: dateStr,
      total_rooms: Math.floor(Math.random() * 100) + 50,
      occupied_rooms: Math.floor(Math.random() * 90) + 10,
      occupancy_rate: (Math.random() * 0.5) + 0.4, // 40-90%
      adr: Math.floor(Math.random() * 100) + 100,
      revpar: Math.floor(Math.random() * 80) + 40,
      alos: (Math.random() * 3) + 1 // 1-4 days
    }
  };
}
