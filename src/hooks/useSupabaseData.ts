import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types matching DB schema
export interface DbSource {
  id: string;
  name: string;
  type: string;
  url: string;
  parser_type: string;
  region_hint: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbKeyword {
  id: string;
  value: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface DbReportRun {
  id: string;
  date: string;
  status: string;
  total_articles: number;
  filtered_articles: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface DbReportItem {
  id: string;
  report_run_id: string;
  region: string;
  title_ko: string;
  title_en: string;
  summary_ko: string[];
  summary_en: string[];
  impact_ko: string;
  impact_en: string;
  tags: string[];
  confidence: number;
  relevance_score: number;
  source_url: string;
  source_name: string;
  published_at: string | null;
}

// Sources
export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sources").select("*").order("created_at");
      if (error) throw error;
      return data as DbSource[];
    },
  });
}

export function useAddSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (source: { name: string; type: string; url: string; parser_type: string; region_hint: string }) => {
      const { data, error } = await supabase.from("sources").insert(source).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useToggleSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("sources").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useDeleteSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

// Keywords
export function useKeywords(type: "include" | "exclude") {
  return useQuery({
    queryKey: ["keywords", type],
    queryFn: async () => {
      const { data, error } = await supabase.from("keywords").select("*").eq("type", type).order("created_at");
      if (error) throw error;
      return data as DbKeyword[];
    },
  });
}

export function useAddKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kw: { value: string; type: string }) => {
      const { data, error } = await supabase.from("keywords").insert(kw).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["keywords"] }),
  });
}

export function useDeleteKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("keywords").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["keywords"] }),
  });
}

// Report Runs
export function useReportRuns() {
  return useQuery({
    queryKey: ["report_runs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("report_runs").select("*").order("date", { ascending: false }).limit(10);
      if (error) throw error;
      return data as DbReportRun[];
    },
  });
}

export function useReportItems(reportRunId?: string) {
  return useQuery({
    queryKey: ["report_items", reportRunId],
    queryFn: async () => {
      if (!reportRunId) return [];
      const { data, error } = await supabase.from("report_items").select("*").eq("report_run_id", reportRunId).order("region");
      if (error) throw error;
      return data as DbReportItem[];
    },
    enabled: !!reportRunId,
  });
}

export function useLatestReport() {
  return useQuery({
    queryKey: ["latest_report"],
    queryFn: async () => {
      const { data, error } = await supabase.from("report_runs").select("*").order("date", { ascending: false }).limit(1).single();
      if (error && error.code !== "PGRST116") throw error;
      return data as DbReportRun | null;
    },
  });
}

export function useLatestReportItems() {
  const { data: report } = useLatestReport();
  return useReportItems(report?.id);
}

// Subscribe
export function useSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || cleanEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error("Invalid email address");
      }
      const { error } = await supabase.from("subscriptions").insert({ email: cleanEmail });
      if (error) {
        if (error.code === "23505") throw new Error("This email is already subscribed.");
        throw new Error("Something went wrong. Please try again.");
      }
    },
  });
}
