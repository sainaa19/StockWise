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
    const { portfolioId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Updating prices for portfolio:', portfolioId);

    // Fetch all holdings for this portfolio
    const { data: holdings, error: fetchError } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId);

    if (fetchError) throw fetchError;

    // Mock price data
    // In production, this would call Yahoo Finance or another API
    const mockPrices: Record<string, number> = {
      'AAPL': 185.50,
      'GOOGL': 2950.00,
      'MSFT': 290.00,
      'TSLA': 850.00,
      'AMZN': 3350.00,
      'NVDA': 520.00,
      'META': 485.00,
      'NFLX': 450.00,
      'AMD': 125.00,
      'INTC': 45.00
    };

    // Update prices for each holding
    for (const holding of holdings || []) {
      const currentPrice = mockPrices[holding.symbol] || holding.buy_price * 1.05;
      
      await supabase
        .from('holdings')
        .update({ 
          current_price: currentPrice,
          last_updated: new Date().toISOString()
        })
        .eq('id', holding.id);
    }

    console.log('Prices updated successfully for', holdings?.length || 0, 'holdings');

    return new Response(
      JSON.stringify({ success: true, updated: holdings?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
