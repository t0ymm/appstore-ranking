import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase/client";
import type { RankingType } from "@/types";

interface SnapshotDate {
  fetch_date: string;
}

// キャッシュされた日付一覧取得関数
const getDates = unstable_cache(
  async (type: RankingType) => {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("ranking_snapshots")
      .select("fetch_date")
      .eq("ranking_type", type)
      .order("fetch_date", { ascending: false })
      .returns<SnapshotDate[]>();

    if (error) {
      throw new Error(error.message);
    }

    return [...new Set(data?.map((d) => d.fetch_date) || [])];
  },
  ["dates"],
  { revalidate: 3600, tags: ["rankings"] } // 1時間キャッシュ
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") || "free") as RankingType;

    const uniqueDates = await getDates(type);

    // CDNキャッシュ用のCache-Controlヘッダーを設定
    const response = NextResponse.json({ dates: uniqueDates });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, dates: [] }, { status: 500 });
  }
}
