import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY")!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // 1. Determine today's date in KST
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = kst.toISOString().slice(0, 10);

    // 2. Check for duplicate run
    const { data: existing } = await supabase
      .from("report_runs")
      .select("id, status")
      .eq("date", dateStr)
      .maybeSingle();

    if (existing && existing.status === "completed") {
      return new Response(JSON.stringify({ message: "Report already completed for " + dateStr }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Create or reuse run
    let runId: string;
    if (existing) {
      runId = existing.id;
      await supabase.from("report_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", runId);
    } else {
      const { data: run, error: runErr } = await supabase
        .from("report_runs")
        .insert({ date: dateStr, status: "running", started_at: new Date().toISOString() })
        .select()
        .single();
      if (runErr) throw runErr;
      runId = run.id;
    }

    // 4. Fetch sources & keywords
    const [{ data: sources }, { data: includeKw }, { data: excludeKw }] = await Promise.all([
      supabase.from("sources").select("*").eq("enabled", true),
      supabase.from("keywords").select("value").eq("type", "include"),
      supabase.from("keywords").select("value").eq("type", "exclude"),
    ]);

    const includeTerms = (includeKw || []).map((k: { value: string }) => k.value.toLowerCase());
    const excludeTerms = (excludeKw || []).map((k: { value: string }) => k.value.toLowerCase());

    // 5. Fetch articles from RSS sources
    const allArticles: { title: string; link: string; sourceName: string; region: string }[] = [];

    for (const source of sources || []) {
      try {
        const res = await fetch(source.url, {
          headers: { "User-Agent": "GMIR-Bot/1.0 (+https://map-watch-report.lovable.app)" },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const text = await res.text();

        // Simple RSS item extraction
        const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
          const itemXml = match[1];
          const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] || "";
          const link = itemXml.match(/<link[^>]*>(.*?)<\/link>/i)?.[1] || "";
          if (title && link) {
            allArticles.push({ title: title.trim(), link: link.trim(), sourceName: source.name, region: source.region_hint });
          }
        }
      } catch {
        // Skip failed sources
      }
    }

    // 6. Filter by keywords
    const seen = new Set<string>();
    const filtered = allArticles.filter((a) => {
      if (seen.has(a.link)) return false;
      seen.add(a.link);
      const lower = (a.title).toLowerCase();
      const hasInclude = includeTerms.length === 0 || includeTerms.some((t) => lower.includes(t));
      const hasExclude = excludeTerms.some((t) => lower.includes(t));
      return hasInclude && !hasExclude;
    });

    // Update counts
    await supabase.from("report_runs").update({ total_articles: allArticles.length, filtered_articles: filtered.length }).eq("id", runId);

    // 7. If no articles, mark complete
    if (filtered.length === 0) {
      await supabase.from("report_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", runId);
      return new Response(JSON.stringify({ message: "No relevant articles found", total: allArticles.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. AI summarization (batch up to 20 articles)
    const batch = filtered.slice(0, 20);
    const articleList = batch.map((a, i) => `${i + 1}. [${a.region}] "${a.title}" (${a.sourceName}) — ${a.link}`).join("\n");

    const aiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GOOGLE_GEMINI_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a Google Maps & local-search intelligence analyst. Given a list of news articles, produce a JSON array of report items. Each item:
{
  "title_en": "English title",
  "title_ko": "Korean title",
  "summary_en": ["bullet 1","bullet 2","bullet 3"],
  "summary_ko": ["요약1","요약2","요약3"],
  "impact_en": "One-line impact for Google Maps professionals",
  "impact_ko": "구글 맵스 전문가를 위한 한줄 영향 분석",
  "tags": ["tag1","tag2"],
  "confidence": 0.0-1.0,
  "relevance_score": 0.0-1.0,
  "region": "NA"|"EU"|"KR"|"Unknown",
  "source_url": "original link",
  "source_name": "source name"
}
Return ONLY a JSON array. No markdown. Max 5 items, pick the most relevant.`,
          },
          { role: "user", content: articleList },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", errText);
      await supabase.from("report_runs").update({ status: "failed" }).eq("id", runId);
      return new Response(JSON.stringify({ error: "AI summarization failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";
    // Strip markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let reportItems: any[];
    try {
      reportItems = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      await supabase.from("report_runs").update({ status: "failed" }).eq("id", runId);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 9. Delete old items for this run and insert new
    await supabase.from("report_items").delete().eq("report_run_id", runId);

    const rows = reportItems.map((item: any) => ({
      report_run_id: runId,
      title_en: String(item.title_en || "").slice(0, 500),
      title_ko: String(item.title_ko || "").slice(0, 500),
      summary_en: Array.isArray(item.summary_en) ? item.summary_en.map(String) : [],
      summary_ko: Array.isArray(item.summary_ko) ? item.summary_ko.map(String) : [],
      impact_en: String(item.impact_en || "").slice(0, 1000),
      impact_ko: String(item.impact_ko || "").slice(0, 1000),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
      relevance_score: Math.max(0, Math.min(1, Number(item.relevance_score) || 0)),
      region: ["NA", "EU", "KR"].includes(item.region) ? item.region : "Unknown",
      source_url: String(item.source_url || "").slice(0, 2000),
      source_name: String(item.source_name || "").slice(0, 200),
      published_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from("report_items").insert(rows);
    if (insertErr) throw insertErr;

    // 10. Mark complete
    await supabase.from("report_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", runId);

    return new Response(
      JSON.stringify({ message: "Pipeline complete", date: dateStr, total: allArticles.length, filtered: filtered.length, items: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Pipeline error:", err);
    return new Response(JSON.stringify({ error: "Pipeline failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
