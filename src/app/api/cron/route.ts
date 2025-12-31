import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchAllRankings } from "@/lib/appstore/fetcher";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = format(new Date(), "yyyy-MM-dd");
    await fetchAllRankings(today);

    // 新しいデータ取得後、キャッシュを即座に無効化
    revalidateTag("rankings", { expire: 0 });

    return NextResponse.json({
      success: true,
      message: `Rankings fetched successfully for ${today}`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
