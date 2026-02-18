import { useState } from "react";
import { Link } from "react-router-dom";
import { useLatestReport, useLatestReportItems, useReportRuns } from "@/hooks/useSupabaseData";
import { StatusBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";
import LangToggle from "@/components/LangToggle";
import { ArrowRight, Clock, FileText, Filter, TrendingUp, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [lang, setLang] = useState<"ko" | "en">("en");
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: report, isLoading: loadingReport } = useLatestReport();
  const { data: items = [] } = useLatestReportItems();
  const { data: pastReports = [], isLoading: loadingPast } = useReportRuns();

  const handleRunPipeline = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-pipeline");
      if (error) throw error;
      toast({ title: lang === "ko" ? "완료!" : "Done!", description: data?.message || "Pipeline finished" });
      queryClient.invalidateQueries({ queryKey: ["latest_report"] });
      queryClient.invalidateQueries({ queryKey: ["report_runs"] });
      queryClient.invalidateQueries({ queryKey: ["report_items"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  if (loadingReport || loadingPast) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasReport = !!report;

  const stats = hasReport
    ? [
        { label: lang === "ko" ? "수집된 기사" : "Articles Fetched", value: report.total_articles, icon: FileText },
        { label: lang === "ko" ? "필터된 기사" : "Filtered", value: report.filtered_articles, icon: Filter },
        { label: lang === "ko" ? "상태" : "Status", value: report.status, icon: TrendingUp },
        { label: lang === "ko" ? "날짜" : "Date", value: report.date, icon: Clock },
      ]
    : [];

  // Map DB items to ReportCard format
  const reportCardItems = items.map((item) => ({
    id: item.id,
    region: (["NA", "EU", "KR"].includes(item.region) ? item.region : "NA") as "NA" | "EU" | "KR" | "Unknown",
    titleKo: item.title_ko,
    titleEn: item.title_en,
    summaryKo: item.summary_ko,
    summaryEn: item.summary_en,
    impactKo: item.impact_ko,
    impactEn: item.impact_en,
    tags: item.tags,
    confidence: Number(item.confidence),
    relevanceScore: Number(item.relevance_score),
    sourceUrl: item.source_url,
    sourceName: item.source_name,
    publishedAt: item.published_at || "",
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "ko" ? "오늘의 인텔리전스" : "Today's Intelligence"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hasReport ? (
              <>{report.date} · <StatusBadge status={report.status as any} /></>
            ) : (
              lang === "ko" ? "아직 리포트가 없습니다" : "No reports yet"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {lang === "ko" ? (running ? "조사 중..." : "지금 조사") : (running ? "Running..." : "Run Now")}
          </button>
          <LangToggle value={lang} onChange={setLang} />
        </div>
      </div>

      {/* Stats */}
      {hasReport && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground font-mono">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Latest items */}
      {reportCardItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {lang === "ko" ? "주요 업데이트" : "Key Updates"}
            </h2>
            <Link to={`/reports/${report?.date || "today"}`} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              {lang === "ko" ? "전체 보기" : "View all"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reportCardItems.slice(0, 4).map((item) => (
              <ReportCard key={item.id} item={item} lang={lang} />
            ))}
          </div>
        </div>
      )}

      {!hasReport && (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {lang === "ko" ? "일일 파이프라인이 실행되면 리포트가 여기에 표시됩니다." : "Reports will appear here once the daily pipeline runs."}
          </p>
        </div>
      )}

      {/* Past reports */}
      {pastReports.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ko" ? "최근 리포트" : "Recent Reports"}
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
            {pastReports.map((r, i) => (
              <Link
                key={r.id}
                to={`/reports/${r.date}`}
                className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                  i < pastReports.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-foreground">{r.date}</span>
                  <StatusBadge status={r.status as any} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{r.filtered_articles} {lang === "ko" ? "건" : "items"}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
