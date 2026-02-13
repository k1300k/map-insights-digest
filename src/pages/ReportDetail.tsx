import { useState } from "react";
import { useParams } from "react-router-dom";
import { mockReport, mockReportItems } from "@/data/mockData";
import { StatusBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";
import LangToggle from "@/components/LangToggle";
import { Region } from "@/data/types";

const regionOrder: Region[] = ["NA", "EU", "KR", "Unknown"];
const regionLabels: Record<Region, { ko: string; en: string }> = {
  NA: { ko: "🇺🇸 북미", en: "🇺🇸 North America" },
  EU: { ko: "🇪🇺 유럽", en: "🇪🇺 Europe" },
  KR: { ko: "🇰🇷 한국", en: "🇰🇷 Korea" },
  Unknown: { ko: "🌐 기타", en: "🌐 Other" },
};

export default function ReportDetail() {
  const { date } = useParams();
  const [lang, setLang] = useState<"ko" | "en">("en");
  const report = mockReport; // In production, fetch by date

  const grouped = regionOrder
    .map((r) => ({ region: r, items: mockReportItems.filter((i) => i.region === r) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "ko" ? "일일 리포트" : "Daily Report"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {date || report.date} · <StatusBadge status={report.status} /> · {report.filteredArticles} {lang === "ko" ? "건" : "items"}
          </p>
        </div>
        <LangToggle value={lang} onChange={setLang} />
      </div>

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
