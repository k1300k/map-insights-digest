import { useState } from "react";
import { ReportItem } from "@/data/types";
import { RegionBadge, ConfidenceBar } from "@/components/Badges";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  item: ReportItem;
  lang: "ko" | "en";
}

export default function ReportCard({ item, lang }: Props) {
  const [expanded, setExpanded] = useState(false);
  const title = lang === "ko" ? item.titleKo : item.titleEn;
  const summary = lang === "ko" ? item.summaryKo : item.summaryEn;
  const impact = lang === "ko" ? item.impactKo : item.impactEn;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <RegionBadge region={item.region} />
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 leading-snug">{title}</h3>

      <ul className="space-y-1.5 mb-3">
        {summary.slice(0, expanded ? undefined : 2).map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {summary.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium mb-3 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? (lang === "ko" ? "접기" : "Show less") : (lang === "ko" ? `+${summary.length - 2}개 더 보기` : `+${summary.length - 2} more`)}
        </button>
      )}

      {expanded && (
        <div className="rounded-lg bg-accent/50 p-3 mb-3">
          <p className="text-xs font-semibold text-accent-foreground mb-1">{lang === "ko" ? "📌 영향 분석" : "📌 Impact Analysis"}</p>
          <p className="text-xs text-muted-foreground">{impact}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-[10px] text-muted-foreground">{item.sourceName}</span>
        <ConfidenceBar value={item.confidence} />
      </div>
    </div>
  );
}
