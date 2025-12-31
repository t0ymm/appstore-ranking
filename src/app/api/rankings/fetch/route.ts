import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchAllRankings } from "@/lib/appstore/fetcher";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || format(new Date(), "yyyy-MM-dd");

    await fetchAllRankings(date);

    // 新しいデータ取得後、キャッシュを即座に無効化
    revalidateTag("rankings", { expire: 0 });

    return NextResponse.json({
      success: true,
      message: `Rankings fetched successfully for ${date}`,
    });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
