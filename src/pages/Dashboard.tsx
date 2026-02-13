import { useState } from "react";
import { Link } from "react-router-dom";
import { mockReport, mockPastReports, mockReportItems } from "@/data/mockData";
import { StatusBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";
import LangToggle from "@/components/LangToggle";
import { ArrowRight, Clock, FileText, Filter, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [lang, setLang] = useState<"ko" | "en">("en");
  const report = mockReport;

  const stats = [
    { label: lang === "ko" ? "수집된 기사" : "Articles Fetched", value: report.totalArticles, icon: FileText },
    { label: lang === "ko" ? "필터된 기사" : "Filtered", value: report.filteredArticles, icon: Filter },
    { label: lang === "ko" ? "신뢰도 평균" : "Avg Confidence", value: "89%", icon: TrendingUp },
    { label: lang === "ko" ? "소요 시간" : "Duration", value: "3m 42s", icon: Clock },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "ko" ? "오늘의 인텔리전스" : "Today's Intelligence"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {report.date} · <StatusBadge status={report.status} />
          </p>
        </div>
        <LangToggle value={lang} onChange={setLang} />
      </div>

      {/* Stats */}
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

      {/* Latest items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            {lang === "ko" ? "주요 업데이트" : "Key Updates"}
          </h2>
          <Link to="/reports/today" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
            {lang === "ko" ? "전체 보기" : "View all"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockReportItems.slice(0, 4).map((item) => (
            <ReportCard key={item.id} item={item} lang={lang} />
          ))}
        </div>
      </div>

      {/* Past reports */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {lang === "ko" ? "최근 리포트" : "Recent Reports"}
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          {mockPastReports.map((r, i) => (
            <Link
              key={r.id}
              to={`/reports/${r.date}`}
              className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                i < mockPastReports.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-medium text-foreground">{r.date}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{r.filteredArticles} {lang === "ko" ? "건" : "items"}</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
