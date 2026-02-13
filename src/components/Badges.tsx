import { Region } from "@/data/types";

export function RegionBadge({ region }: { region: Region }) {
  const config: Record<Region, { label: string; className: string }> = {
    NA: { label: "🇺🇸 NA", className: "bg-maps-blue/10 text-maps-blue" },
    EU: { label: "🇪🇺 EU", className: "bg-[hsl(var(--region-eu)/0.1)] text-[hsl(var(--region-eu))]" },
    KR: { label: "🇰🇷 KR", className: "bg-maps-red/10 text-maps-red" },
    Unknown: { label: "🌐 Other", className: "bg-muted text-muted-foreground" },
  };
  const c = config[region];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${c.className}`}>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    completed: "bg-primary/10 text-primary",
    running: "bg-maps-yellow/10 text-maps-yellow",
    pending: "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${config[status] || config.pending}`}>
      {status}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
    </div>
  );
}
