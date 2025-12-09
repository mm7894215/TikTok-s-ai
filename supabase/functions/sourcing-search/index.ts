import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, Content-Type, Authorization",
  "Access-Control-Allow-Methods": "OPTIONS, POST"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { videoId, imageBase64 } = await req.json();

  await supabaseClient.from("sourcing_search_logs").insert({
    video_id: videoId ?? null,
    image_base64: imageBase64?.slice(0, 128) ?? null
  });

  const { data } = await supabaseClient
    .from("product_candidates")
    .select("id, source, url, price, currency, moq, rating, estimated_gross_margin")
    .order("estimated_gross_margin", { ascending: false })
    .limit(6);

  return new Response(JSON.stringify({ candidates: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
