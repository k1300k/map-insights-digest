export type SourceType = "rss" | "html";
export type Region = "NA" | "EU" | "KR" | "Unknown";
export type ReportStatus = "pending" | "running" | "completed" | "failed";
export type KeywordType = "include" | "exclude";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  parserType: string;
  regionHint: Region;
  enabled: boolean;
}

export interface Keyword {
  id: string;
  value: string;
  type: KeywordType;
}

export interface ReportItem {
  id: string;
  region: Region;
  titleKo: string;
  titleEn: string;
  summaryKo: string[];
  summaryEn: string[];
  impactKo: string;
  impactEn: string;
  tags: string[];
  confidence: number;
  relevanceScore: number;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
}

export interface ReportRun {
  id: string;
  date: string;
  status: ReportStatus;
  totalArticles: number;
  filteredArticles: number;
  startedAt: string;
  completedAt: string;
  items: ReportItem[];
}
