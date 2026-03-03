import { useState } from "react";
import { useParams } from "react-router-dom";
import { useReportRuns, useReportItems } from "@/hooks/useSupabaseData";
import { StatusBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";
import LangToggle from "@/components/LangToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

      <Tabs defaultValue="NA">
        <TabsList className="mb-4">
          {regionOrder.map((region) => {
            const count = cardItems.filter((i) => i.region === region).length;
            return (
              <TabsTrigger key={region} value={region} className="text-xs gap-1.5">
                {regionLabels[region][lang]}
                {count > 0 && <span className="text-muted-foreground font-normal">({count})</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {regionOrder.map((region) => {
          const regionItems = cardItems.filter((i) => i.region === region);
          return (
            <TabsContent key={region} value={region}>
              {regionItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {regionItems.map((item) => (
                    <ReportCard key={item.id} item={item} lang={lang} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {lang === "ko" ? "해당 지역의 업데이트가 없습니다." : "No updates for this region."}
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
