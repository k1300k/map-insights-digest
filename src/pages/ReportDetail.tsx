import { useState } from "react";
import { useParams } from "react-router-dom";
import { useReportRuns, useReportItems } from "@/hooks/useSupabaseData";
import { StatusBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";
import LangToggle from "@/components/LangToggle";
import { Loader2 } from "lucide-react";
import type { Region } from "@/data/types";

const regionOrder: Region[] = ["NA", "EU", "KR"];
const regionLabels: Record<string, { ko: string; en: string }> = {
  NA: { ko: "🇺🇸 북미", en: "🇺🇸 North America" },
  EU: { ko: "🇪🇺 유럽", en: "🇪🇺 Europe" },
  KR: { ko: "🇰🇷 한국", en: "🇰🇷 Korea" },
};

export default function ReportDetail() {
  const { date } = useParams();
  const [lang, setLang] = useState<"ko" | "en">("en");
  const { data: runs = [], isLoading } = useReportRuns();

  const report = runs.find((r) => r.date === date) || runs[0];
  const { data: items = [], isLoading: loadingItems } = useReportItems(report?.id);

  if (isLoading || loadingItems) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cardItems = items.map((item) => ({
    id: item.id,
    region: item.region as Region,
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

  const grouped = regionOrder
    .map((r) => ({ region: r, items: cardItems.filter((i) => i.region === r) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "ko" ? "일일 리포트" : "Daily Report"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {report ? (
              <>{report.date} · <StatusBadge status={report.status as any} /> · {report.filtered_articles} {lang === "ko" ? "건" : "items"}</>
            ) : (
              lang === "ko" ? "리포트를 찾을 수 없습니다" : "Report not found"
            )}
          </p>
        </div>
        <LangToggle value={lang} onChange={setLang} />
      </div>

      {grouped.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {lang === "ko" ? "이 리포트에 항목이 없습니다." : "No items in this report."}
          </p>
        </div>
      )}

      {grouped.map((group) => (
        <section key={group.region}>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            {regionLabels[group.region][lang]}
            <span className="text-xs text-muted-foreground font-normal">({group.items.length})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.items.map((item) => (
              <ReportCard key={item.id} item={item} lang={lang} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
