export type RankingType = "free" | "paid";

export type SortField = "rank" | "rating" | "review_count";
export type SortOrder = "asc" | "desc";
export type DeveloperType = "all" | "company" | "individual";

// 企業判定用のパターン
const COMPANY_PATTERNS = [
  // 日本語
  /株式会社/,
  /合同会社/,
  /有限会社/,
  /一般社団法人/,
  /一般財団法人/,
  /特定非営利活動法人/,
  /NPO法人/,
  // 英語
  /\bInc\.?$/i,
  /\bLLC\.?$/i,
  /\bLtd\.?$/i,
  /\bCorp\.?$/i,
  /\bCorporation$/i,
  /\bCompany$/i,
  /\bCo\.?,?\s*(Ltd|Inc)?\.?$/i,
  /\bGmbH$/i,
  /\bS\.?A\.?$/,
  /\bB\.?V\.?$/,
  /\bPte\.?\s*Ltd\.?$/i,
  /\bPLC$/i,
  /\bLimited$/i,
];

export function isCompanyDeveloper(name: string | null): boolean {
  if (!name) return false;
  return COMPANY_PATTERNS.some(pattern => pattern.test(name));
}

export interface Genre {
  id: string;
  name: string;
}

export interface RankingFilters {
  date: string;
  type: RankingType;
  category?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface RankingItem {
  id: string;
  rank: number;
  appId: string;
  appName: string;
  appIconUrl: string | null;
  developerName: string | null;
  price: number;
  currency: string;
  rating: number | null;
  reviewCount: number;
  appStoreUrl: string | null;
  primaryGenre: string | null;
  primaryGenreId: string | null;
  genres: Genre[] | null;
}

export const CATEGORIES: Record<string, string> = {
  "6014": "ゲーム",
  "6016": "エンターテインメント",
  "6008": "写真/ビデオ",
  "6005": "ソーシャルネットワーキング",
  "6012": "ライフスタイル",
  "6011": "ミュージック",
  "6002": "ユーティリティ",
  "6024": "ショッピング",
  "6017": "教育",
  "6013": "ヘルスケア/フィットネス",
  "6000": "ビジネス",
  "6015": "ファイナンス",
  "6003": "旅行",
  "6023": "フード/ドリンク",
  "6009": "ニュース",
  "6007": "仕事効率化",
  "6001": "天気",
  "6004": "スポーツ",
  "6006": "リファレンス",
  "6010": "ナビゲーション",
  "6020": "メディカル",
  "6021": "マガジン/新聞",
  "6018": "ブック",
};
