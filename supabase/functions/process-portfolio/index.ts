import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileType } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing portfolio:', filePath, fileType);

    // Create portfolio record
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        file_path: filePath,
        file_type: fileType,
        status: 'processing'
      })
      .select()
      .single();

    if (portfolioError) throw portfolioError;

    // Mock portfolio data extraction
    // In production, this would:
    // - Download the file from storage
    // - Parse CSV or use OCR for images
    // - Extract stock data
    
    let holdings = [];
    
    if (fileType === 'text/csv') {
      // Mock CSV parsing
      holdings = [
        { symbol: 'AAPL', quantity: 10, buy_price: 150.00 },
        { symbol: 'GOOGL', quantity: 5, buy_price: 2800.00 },
        { symbol: 'MSFT', quantity: 15, buy_price: 300.00 }
      ];
    } else {
      // Mock OCR extraction from image
      holdings = [
        { symbol: 'TSLA', quantity: 8, buy_price: 700.00 },
        { symbol: 'AMZN', quantity: 12, buy_price: 3200.00 },
        { symbol: 'NVDA', quantity: 20, buy_price: 450.00 }
      ];
    }

    // Insert holdings
    const holdingsToInsert = holdings.map(h => ({
      portfolio_id: portfolio.id,
      symbol: h.symbol,
      quantity: h.quantity,
      buy_price: h.buy_price
    }));

    const { error: holdingsError } = await supabase
      .from('holdings')
      .insert(holdingsToInsert);

    if (holdingsError) throw holdingsError;

    // Fetch current prices for all holdings
    const { error: priceError } = await supabase.functions.invoke('update-prices', {
      body: { portfolioId: portfolio.id }
    });

    if (priceError) {
      console.error('Price update error:', priceError);
      // Continue anyway - prices can be updated later
    }

    // Update portfolio status
    await supabase
      .from('portfolios')
      .update({ status: 'completed' })
      .eq('id', portfolio.id);

    console.log('Portfolio processed successfully:', portfolio.id);

    return new Response(
      JSON.stringify({ portfolioId: portfolio.id, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error processing portfolio:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
