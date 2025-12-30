import type { RssFeedResponse, RssFeedApp, iTunesLookupResponse, iTunesApp } from "./types";
import type { RankingType, Genre } from "@/types";
import { createServerClient } from "@/lib/supabase/client";

const RSS_BASE_URL = "https://rss.marketingtools.apple.com/api/v2/jp/apps";
const ITUNES_RSS_URL = "https://itunes.apple.com/jp/rss";
const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const RANKING_LIMIT = 100;
const BATCH_SIZE = 100;

// 取得するカテゴリ一覧（CATEGORIES と同期）
const CATEGORIES_TO_FETCH = [
  { id: null, name: "総合" },
  { id: "6014", name: "ゲーム" },
  { id: "6016", name: "エンターテインメント" },
  { id: "6008", name: "写真/ビデオ" },
  { id: "6005", name: "ソーシャルネットワーキング" },
  { id: "6012", name: "ライフスタイル" },
  { id: "6011", name: "ミュージック" },
  { id: "6002", name: "ユーティリティ" },
  { id: "6024", name: "ショッピング" },
  { id: "6017", name: "教育" },
  { id: "6013", name: "ヘルスケア/フィットネス" },
  { id: "6000", name: "ビジネス" },
  { id: "6015", name: "ファイナンス" },
  { id: "6003", name: "旅行" },
  { id: "6023", name: "フード/ドリンク" },
  { id: "6009", name: "ニュース" },
  { id: "6007", name: "仕事効率化" },
  { id: "6001", name: "天気" },
  { id: "6004", name: "スポーツ" },
  { id: "6006", name: "リファレンス" },
  { id: "6010", name: "ナビゲーション" },
  { id: "6020", name: "メディカル" },
  { id: "6021", name: "マガジン/新聞" },
  { id: "6018", name: "ブック" },
];

interface SnapshotId {
  id: string;
}

interface SnapshotRow {
  id: string;
  fetch_date: string;
  ranking_type: string;
  category_id: string | null;
  created_at: string;
}

interface iTunesRssEntry {
  "im:name": { label: string };
  "im:image": { label: string }[];
  "im:artist": { label: string };
  id: { attributes: { "im:id": string }; label: string };
  "im:price"?: { attributes: { amount: string; currency: string } };
  category?: { attributes: { "im:id": string; label: string } };
}

interface iTunesRssResponse {
  feed: {
    entry: iTunesRssEntry[];
  };
}

// 総合ランキング用（新API）
export async function fetchRankingFromNewRss(type: RankingType): Promise<RssFeedApp[]> {
  const rankingType = type === "free" ? "top-free" : "top-paid";
  const url = `${RSS_BASE_URL}/${rankingType}/${RANKING_LIMIT}/apps.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const data: RssFeedResponse = await response.json();
  return data.feed.results;
}

// カテゴリ別ランキング用（旧iTunes RSS）
export async function fetchRankingFromiTunesRss(type: RankingType, categoryId: string): Promise<RssFeedApp[]> {
  const rankingType = type === "free" ? "topfreeapplications" : "toppaidapplications";
  const url = `${ITUNES_RSS_URL}/${rankingType}/limit=${RANKING_LIMIT}/genre=${categoryId}/json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iTunes RSS: ${response.status}`);
  }

  const data: iTunesRssResponse = await response.json();

  return data.feed.entry.map((entry) => ({
    id: entry.id.attributes["im:id"],
    name: entry["im:name"].label,
    artistName: entry["im:artist"].label,
    artworkUrl100: entry["im:image"][2]?.label || entry["im:image"][0]?.label || "",
    url: entry.id.label,
    releaseDate: "",
    kind: "apps",
    genres: [],
  }));
}

export async function fetchRankingFromRss(type: RankingType, categoryId: string | null): Promise<RssFeedApp[]> {
  if (categoryId) {
    return fetchRankingFromiTunesRss(type, categoryId);
  } else {
    return fetchRankingFromNewRss(type);
  }
}

export async function fetchAppDetails(appIds: string[]): Promise<Map<string, iTunesApp>> {
  const appDetailsMap = new Map<string, iTunesApp>();

  for (let i = 0; i < appIds.length; i += BATCH_SIZE) {
    const batch = appIds.slice(i, i + BATCH_SIZE);
    const ids = batch.join(",");
    const url = `${ITUNES_LOOKUP_URL}?id=${ids}&country=jp`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch app details: ${response.status}`);
        continue;
      }

      const data: iTunesLookupResponse = await response.json();
      for (const app of data.results) {
        appDetailsMap.set(String(app.trackId), app);
      }

      if (i + BATCH_SIZE < appIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error fetching app details:", error);
    }
  }

  return appDetailsMap;
}

export async function fetchAndSaveRankings(
  type: RankingType,
  date: string,
  categoryId: string | null,
  categoryName: string
): Promise<number> {
  const supabase = createServerClient();

  // 既存のスナップショットを削除
  let existingQuery = supabase
    .from("ranking_snapshots")
    .select("id")
    .eq("fetch_date", date)
    .eq("ranking_type", type);

  if (categoryId) {
    existingQuery = existingQuery.eq("category_id", categoryId);
  } else {
    existingQuery = existingQuery.is("category_id", null);
  }

  const { data: existingSnapshots } = await existingQuery.returns<SnapshotId[]>();

  if (existingSnapshots && existingSnapshots.length > 0) {
    const existingSnapshot = existingSnapshots[0];
    await supabase
      .from("ranking_entries")
      .delete()
      .eq("snapshot_id", existingSnapshot.id);
    await supabase
      .from("ranking_snapshots")
      .delete()
      .eq("id", existingSnapshot.id);
  }

  const rssApps = await fetchRankingFromRss(type, categoryId);
  const appIds = rssApps.map((app) => app.id);
  const appDetails = await fetchAppDetails(appIds);

  const { data: snapshots, error: snapshotError } = await supabase
    .from("ranking_snapshots")
    .insert({
      fetch_date: date,
      ranking_type: type,
      category_id: categoryId,
      category_name: categoryName,
    })
    .select()
    .returns<SnapshotRow[]>();

  if (snapshotError || !snapshots || snapshots.length === 0) {
    throw new Error(`Failed to create snapshot: ${snapshotError?.message}`);
  }

  const snapshot = snapshots[0];

  const entries = rssApps.map((app, index) => {
    const details = appDetails.get(app.id);
    const genres: Genre[] | null = details
      ? details.genreIds.map((id, i) => ({
          id,
          name: details.genres[i] || "",
        }))
      : null;

    return {
      snapshot_id: snapshot.id,
      rank: index + 1,
      app_id: app.id,
      app_name: app.name,
      app_icon_url: app.artworkUrl100,
      developer_name: app.artistName,
      price: details?.price ?? 0,
      currency: details?.currency ?? "JPY",
      rating: details?.averageUserRating ?? null,
      review_count: details?.userRatingCount ?? 0,
      app_store_url: app.url,
      primary_genre: details?.primaryGenreName ?? null,
      primary_genre_id: details ? String(details.primaryGenreId) : null,
      genres: genres,
    };
  });

  const { error: entriesError } = await supabase
    .from("ranking_entries")
    .insert(entries);

  if (entriesError) {
    throw new Error(`Failed to insert entries: ${entriesError.message}`);
  }

  return entries.length;
}

export async function fetchAllRankings(date: string): Promise<{ total: number; categories: number }> {
  let total = 0;
  let categories = 0;

  for (const category of CATEGORIES_TO_FETCH) {
    try {
      // 無料ランキング
      const freeCount = await fetchAndSaveRankings("free", date, category.id, category.name);
      total += freeCount;

      // 有料ランキング
      const paidCount = await fetchAndSaveRankings("paid", date, category.id, category.name);
      total += paidCount;

      categories++;

      // レート制限対策
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching category ${category.name}:`, error);
    }
  }

  return { total, categories };
}
