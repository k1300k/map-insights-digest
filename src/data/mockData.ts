import { type ReportRun, type ReportItem, type Source, type Keyword } from "./types";

export const mockSources: Source[] = [
  { id: "1", name: "Google Maps Platform Blog", type: "rss", url: "https://cloud.google.com/blog/products/maps-platform/rss", parserType: "standard", regionHint: "NA", enabled: true },
  { id: "2", name: "Search Engine Land - Local", type: "rss", url: "https://searchengineland.com/category/local/feed", parserType: "standard", regionHint: "NA", enabled: true },
  { id: "3", name: "Sterling Sky Blog", type: "html", url: "https://sterlingsky.ca/blog/", parserType: "blog", regionHint: "NA", enabled: true },
  { id: "4", name: "BrightLocal Blog", type: "rss", url: "https://www.brightlocal.com/feed/", parserType: "standard", regionHint: "EU", enabled: true },
  { id: "5", name: "Local Search Forum", type: "html", url: "https://localsearchforum.com/", parserType: "forum", regionHint: "NA", enabled: true },
  { id: "6", name: "네이버 블로그 - 지도", type: "html", url: "https://blog.naver.com/maps", parserType: "naver", regionHint: "KR", enabled: true },
  { id: "7", name: "Google Business Profile Help", type: "html", url: "https://support.google.com/business/community", parserType: "support", regionHint: "NA", enabled: true },
  { id: "8", name: "Search Engine Journal - Local", type: "rss", url: "https://www.searchenginejournal.com/category/local-search/feed/", parserType: "standard", regionHint: "NA", enabled: true },
  { id: "9", name: "Moz Local Blog", type: "rss", url: "https://moz.com/blog/feed", parserType: "standard", regionHint: "NA", enabled: false },
  { id: "10", name: "GeoAwesomeness", type: "rss", url: "https://geoawesomeness.com/feed/", parserType: "standard", regionHint: "EU", enabled: true },
  { id: "11", name: "한국 지역정보 블로그", type: "html", url: "https://localinfo.kr/blog", parserType: "blog", regionHint: "KR", enabled: true },
  { id: "12", name: "Maps Mania", type: "rss", url: "https://googlemapsmania.blogspot.com/feeds/posts/default", parserType: "standard", regionHint: "NA", enabled: true },
];

export const mockIncludeKeywords: Keyword[] = [
  { id: "1", value: "Google Maps", type: "include" },
  { id: "2", value: "Google Business Profile", type: "include" },
  { id: "3", value: "Local SEO", type: "include" },
  { id: "4", value: "Maps API", type: "include" },
  { id: "5", value: "GBP update", type: "include" },
  { id: "6", value: "지도 업데이트", type: "include" },
];

export const mockExcludeKeywords: Keyword[] = [
  { id: "7", value: "gaming", type: "exclude" },
  { id: "8", value: "unrelated product news", type: "exclude" },
  { id: "9", value: "Apple Maps", type: "exclude" },
];

export const mockReportItems: ReportItem[] = [
  {
    id: "1",
    region: "NA",
    titleKo: "구글 맵스, 새로운 AI 기반 장소 추천 기능 출시",
    titleEn: "Google Maps Launches New AI-Powered Place Recommendations",
    summaryKo: [
      "구글 맵스가 AI 기반의 개인화된 장소 추천 기능을 출시했습니다",
      "사용자의 검색 기록과 위치 데이터를 기반으로 맞춤형 추천을 제공합니다",
      "현재 미국에서 먼저 출시되며, 추후 글로벌 확장 예정입니다",
      "기존 추천 시스템 대비 클릭률이 40% 향상되었습니다",
    ],
    summaryEn: [
      "Google Maps has launched AI-powered personalized place recommendations",
      "Provides tailored suggestions based on user search history and location data",
      "Currently rolling out in the US first, with global expansion planned",
      "Click-through rate improved by 40% compared to previous recommendation system",
    ],
    impactKo: "로컬 비즈니스의 노출 방식에 큰 변화가 예상되며, GBP 최적화 전략 수정이 필요합니다",
    impactEn: "Expected to significantly change local business visibility, requiring GBP optimization strategy updates",
    tags: ["AI", "recommendations", "personalization"],
    confidence: 0.92,
    relevanceScore: 0.95,
    sourceUrl: "https://blog.google/products/maps/ai-recommendations",
    sourceName: "Google Maps Platform Blog",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "2",
    region: "NA",
    titleKo: "GBP 리뷰 응답에 AI 자동 응답 기능 테스트 중",
    titleEn: "GBP Testing AI Auto-Reply Feature for Reviews",
    summaryKo: [
      "구글이 비즈니스 프로필 리뷰에 대한 AI 자동 응답 기능을 테스트 중입니다",
      "비즈니스 오너가 AI 생성 응답을 검토 후 게시할 수 있습니다",
      "소규모 비즈니스의 리뷰 관리 부담을 줄이는 것이 목표입니다",
    ],
    summaryEn: [
      "Google is testing an AI auto-reply feature for Business Profile reviews",
      "Business owners can review AI-generated responses before publishing",
      "Aims to reduce review management burden for small businesses",
    ],
    impactKo: "소규모 비즈니스의 리뷰 관리 효율성이 크게 향상될 것으로 예상됩니다",
    impactEn: "Expected to significantly improve review management efficiency for small businesses",
    tags: ["GBP", "AI", "reviews", "automation"],
    confidence: 0.85,
    relevanceScore: 0.88,
    sourceUrl: "https://searchengineland.com/gbp-ai-review-replies",
    sourceName: "Search Engine Land",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "3",
    region: "EU",
    titleKo: "유럽 DMA 규정에 따른 구글 맵스 검색 결과 변경",
    titleEn: "Google Maps Search Results Changes Under EU DMA Regulations",
    summaryKo: [
      "EU 디지털 시장법(DMA)에 따라 구글 맵스 검색 결과 표시 방식이 변경됩니다",
      "경쟁 지도 서비스에 대한 공정한 접근을 보장하는 방향으로 조정됩니다",
      "유럽 내 로컬 비즈니스 검색 순위에 영향을 줄 수 있습니다",
    ],
    summaryEn: [
      "Google Maps search result display is changing under EU Digital Markets Act (DMA)",
      "Adjustments ensure fair access for competing mapping services",
      "May affect local business search rankings within Europe",
    ],
    impactKo: "유럽 시장에서 로컬 SEO 전략의 재검토가 필요합니다",
    impactEn: "Requires reassessment of local SEO strategies in the European market",
    tags: ["DMA", "EU", "regulation", "competition"],
    confidence: 0.90,
    relevanceScore: 0.82,
    sourceUrl: "https://brightlocal.com/eu-dma-maps-changes",
    sourceName: "BrightLocal Blog",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "4",
    region: "KR",
    titleKo: "구글 맵스 코리아, 실시간 대중교통 정보 대폭 업데이트",
    titleEn: "Google Maps Korea Significantly Updates Real-Time Transit Info",
    summaryKo: [
      "구글 맵스가 한국 내 실시간 대중교통 정보를 대폭 업데이트했습니다",
      "서울 및 주요 도시의 버스, 지하철 실시간 도착 정보가 개선되었습니다",
      "네이버 지도, 카카오맵과의 경쟁이 더욱 치열해질 전망입니다",
    ],
    summaryEn: [
      "Google Maps has significantly updated real-time transit information in Korea",
      "Improved real-time bus and subway arrival info for Seoul and major cities",
      "Competition with Naver Maps and KakaoMap expected to intensify",
    ],
    impactKo: "한국 시장에서 구글 맵스의 점유율 확대 가능성이 높아졌습니다",
    impactEn: "Increases Google Maps' potential for market share expansion in Korea",
    tags: ["Korea", "transit", "real-time", "competition"],
    confidence: 0.88,
    relevanceScore: 0.91,
    sourceUrl: "https://localinfo.kr/google-maps-transit-update",
    sourceName: "한국 지역정보 블로그",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "5",
    region: "NA",
    titleKo: "Maps JavaScript API v3.58 업데이트 - 새로운 마커 클러스터링",
    titleEn: "Maps JavaScript API v3.58 Update - New Marker Clustering",
    summaryKo: [
      "Maps JavaScript API v3.58이 새로운 마커 클러스터링 기능을 포함하여 출시되었습니다",
      "성능이 기존 대비 60% 향상되었으며, 커스터마이징 옵션이 추가되었습니다",
      "기존 MarkerClusterer 라이브러리와의 마이그레이션 가이드가 제공됩니다",
    ],
    summaryEn: [
      "Maps JavaScript API v3.58 released with new marker clustering capabilities",
      "Performance improved by 60% with additional customization options",
      "Migration guide from legacy MarkerClusterer library provided",
    ],
    impactKo: "Maps API를 사용하는 개발자들은 새 클러스터링 API로 마이그레이션을 검토해야 합니다",
    impactEn: "Developers using Maps API should consider migrating to the new clustering API",
    tags: ["API", "JavaScript", "clustering", "developer"],
    confidence: 0.95,
    relevanceScore: 0.78,
    sourceUrl: "https://developers.google.com/maps/changelog",
    sourceName: "Google Maps Platform Blog",
    publishedAt: new Date().toISOString(),
  },
];

const today = new Date();
const dateStr = today.toISOString().split("T")[0];

export const mockReport: ReportRun = {
  id: "report-1",
  date: dateStr,
  status: "completed",
  totalArticles: 47,
  filteredArticles: 5,
  startedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0).toISOString(),
  completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 3, 42).toISOString(),
  items: mockReportItems,
};

export const mockPastReports: ReportRun[] = [
  mockReport,
  { id: "report-2", date: "2026-02-12", status: "completed", totalArticles: 39, filteredArticles: 4, startedAt: "2026-02-12T07:00:00Z", completedAt: "2026-02-12T07:02:58Z", items: [] },
  { id: "report-3", date: "2026-02-11", status: "completed", totalArticles: 52, filteredArticles: 6, startedAt: "2026-02-11T07:00:00Z", completedAt: "2026-02-11T07:04:12Z", items: [] },
  { id: "report-4", date: "2026-02-10", status: "completed", totalArticles: 41, filteredArticles: 3, startedAt: "2026-02-10T07:00:00Z", completedAt: "2026-02-10T07:02:15Z", items: [] },
  { id: "report-5", date: "2026-02-09", status: "failed", totalArticles: 0, filteredArticles: 0, startedAt: "2026-02-09T07:00:00Z", completedAt: "2026-02-09T07:00:45Z", items: [] },
];
