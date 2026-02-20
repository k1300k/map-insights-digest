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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let token: string | undefined;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate token is a non-empty string (UUID format)
  if (!token || typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response(JSON.stringify({ error: "Invalid or missing token" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role to perform the update server-side (bypasses client RLS safely)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status: "inactive" })
    .eq("token", token)
    .select("id")
    .single();

  if (error || !data) {
    // Return generic message to avoid leaking info about token existence
    return new Response(
      JSON.stringify({ message: "If that token exists, the subscription has been cancelled." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ message: "Successfully unsubscribed." }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
