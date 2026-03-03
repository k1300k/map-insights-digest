import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pipelineUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/run-pipeline`;
    const pipelineSecret = Deno.env.get("PIPELINE_SECRET") || "";

    const res = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": pipelineSecret,
      },
      body: JSON.stringify({ force: true }),
    });

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Trigger pipeline error:", error);
    return new Response(JSON.stringify({ error: "Failed to trigger pipeline" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
