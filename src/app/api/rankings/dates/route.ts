import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import type { RankingType } from "@/types";

interface SnapshotDate {
  fetch_date: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") || "free") as RankingType;

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("ranking_snapshots")
      .select("fetch_date")
      .eq("ranking_type", type)
      .order("fetch_date", { ascending: false })
      .returns<SnapshotDate[]>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const dates = data?.map((d) => d.fetch_date) || [];

    return NextResponse.json({ dates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, dates: [] }, { status: 500 });
  }
}
