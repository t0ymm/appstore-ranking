import { NextRequest, NextResponse } from "next/server";
import { fetchAllRankings } from "@/lib/appstore/fetcher";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || format(new Date(), "yyyy-MM-dd");

    await fetchAllRankings(date);

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
