import type { RssFeedResponse, RssFeedApp, iTunesLookupResponse, iTunesApp } from "./types";
import type { RankingType, Genre } from "@/types";
import { createServerClient } from "@/lib/supabase/client";

const RSS_BASE_URL = "https://rss.marketingtools.apple.com/api/v2/jp/apps";
const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const RANKING_LIMIT = 200;
const BATCH_SIZE = 100;

interface SnapshotId {
  id: string;
}

interface SnapshotRow {
  id: string;
  fetch_date: string;
  ranking_type: string;
  created_at: string;
}

export async function fetchRankingFromRss(type: RankingType): Promise<RssFeedApp[]> {
  const rankingType = type === "free" ? "top-free" : "top-paid";
  const url = `${RSS_BASE_URL}/${rankingType}/${RANKING_LIMIT}/apps.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const data: RssFeedResponse = await response.json();
  return data.feed.results;
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

export async function fetchAndSaveRankings(type: RankingType, date: string): Promise<void> {
  const supabase = createServerClient();

  const { data: existingSnapshots } = await supabase
    .from("ranking_snapshots")
    .select("id")
    .eq("fetch_date", date)
    .eq("ranking_type", type)
    .returns<SnapshotId[]>();

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

  const rssApps = await fetchRankingFromRss(type);
  const appIds = rssApps.map((app) => app.id);
  const appDetails = await fetchAppDetails(appIds);

  const { data: snapshots, error: snapshotError } = await supabase
    .from("ranking_snapshots")
    .insert({
      fetch_date: date,
      ranking_type: type,
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
}

export async function fetchAllRankings(date: string): Promise<void> {
  await fetchAndSaveRankings("free", date);
  await fetchAndSaveRankings("paid", date);
}
