import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Safely try to parse body (in case frontend sends something)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    console.log("process-portfolio stub called with body:", body);

    // Just return success, no DB access at all
    return new Response(
      JSON.stringify({
        success: true,
        portfolioId: 1,
        message:
          "process-portfolio is running in stub mode (no Supabase DB calls).",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in process-portfolio function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
