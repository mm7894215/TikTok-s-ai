import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const payload = await req.json();
  const { videoId, stats, snapshotTime } = payload;

  const { error } = await supabaseClient.from("video_stats_snapshot").insert({
    video_id: videoId,
    snapshot_time: snapshotTime ?? new Date().toISOString(),
    views: stats?.views ?? 0,
    likes: stats?.likes ?? 0,
    comments: stats?.comments ?? 0,
    shares: stats?.shares ?? 0,
    saves: stats?.saves ?? 0
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
});
