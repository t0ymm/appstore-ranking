import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import type { RankingType, SortField, SortOrder, Genre } from "@/types";

interface RankingEntryWithSnapshot {
  id: string;
  rank: number;
  app_id: string;
  app_name: string;
  app_icon_url: string | null;
  developer_name: string | null;
  price: number;
  currency: string;
  rating: number | null;
  review_count: number;
  app_store_url: string | null;
  primary_genre: string | null;
  primary_genre_id: string | null;
  genres: Genre[] | null;
  ranking_snapshots: {
    fetch_date: string;
    ranking_type: string;
    category_id: string | null;
    category_name: string | null;
  };
}

interface SnapshotDate {
  fetch_date: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const type = (searchParams.get("type") || "free") as RankingType;
    const category = searchParams.get("category");
    const sortBy = (searchParams.get("sortBy") || "rank") as SortField;
    const sortOrder = (searchParams.get("sortOrder") || "asc") as SortOrder;

    const supabase = createServerClient();

    let targetDate = date;

    if (!targetDate) {
      const { data: snapshots } = await supabase
        .from("ranking_snapshots")
        .select("fetch_date")
        .eq("ranking_type", type)
        .order("fetch_date", { ascending: false })
        .limit(1)
        .returns<SnapshotDate[]>();

      if (snapshots && snapshots.length > 0) {
        targetDate = snapshots[0].fetch_date;
      } else {
        return NextResponse.json({ entries: [], date: null });
      }
    }

    let query = supabase
      .from("ranking_entries")
      .select(`
        *,
        ranking_snapshots!inner(
          fetch_date,
          ranking_type,
          category_id,
          category_name
        )
      `)
      .eq("ranking_snapshots.ranking_type", type)
      .eq("ranking_snapshots.fetch_date", targetDate);

    if (category) {
      query = query.eq("ranking_snapshots.category_id", category);
    } else {
      query = query.is("ranking_snapshots.category_id", null);
    }

    const sortColumn = sortBy === "review_count" ? "review_count" : sortBy;
    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    const { data, error } = await query.returns<RankingEntryWithSnapshot[]>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = data?.map((entry) => ({
      id: entry.id,
      rank: entry.rank,
      appId: entry.app_id,
      appName: entry.app_name,
      appIconUrl: entry.app_icon_url,
      developerName: entry.developer_name,
      price: entry.price,
      currency: entry.currency,
      rating: entry.rating,
      reviewCount: entry.review_count,
      appStoreUrl: entry.app_store_url,
      primaryGenre: entry.primary_genre,
      primaryGenreId: entry.primary_genre_id,
      genres: entry.genres,
    }));

    const fetchDate = data?.[0]?.ranking_snapshots?.fetch_date || null;

    return NextResponse.json({ entries, date: fetchDate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, entries: [], date: null }, { status: 500 });
  }
}
