import { NextRequest, NextResponse } from "next/server";
import { getActivityStats } from "@/lib/activities-db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30"), 90);
    const stats = getActivityStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Activity stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity stats" },
      { status: 500 }
    );
  }
}
