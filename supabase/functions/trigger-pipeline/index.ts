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

  // Verify the caller is authenticated
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
    authHeader.replace("Bearer ", "")
  );
  if (claimsErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Call run-pipeline with the shared secret
  const pipelineUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/run-pipeline`;
  const pipelineSecret = Deno.env.get("PIPELINE_SECRET") || "";

  const res = await fetch(pipelineUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pipeline-secret": pipelineSecret,
    },
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
