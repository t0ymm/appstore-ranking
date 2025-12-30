export type RankingType = "free" | "paid";

export type SortField = "rank" | "rating" | "review_count";
export type SortOrder = "asc" | "desc";

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
