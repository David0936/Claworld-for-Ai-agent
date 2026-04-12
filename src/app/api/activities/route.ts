import { NextRequest, NextResponse } from "next/server";
import {
  listActivities,
  insertActivity,
  type ListActivitiesOptions,
} from "@/lib/activities-db";
import { z } from "zod";

const PostSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  metadata: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;
    const days = parseInt(searchParams.get("days") || "7");

    const options: ListActivitiesOptions = {
      limit: Math.min(limit, 200),
      offset,
      type,
      search,
      days: Math.min(days, 90),
    };

    const result = listActivities(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Activities GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const id = insertActivity(parsed.data);
    return NextResponse.json({ id, ...parsed.data }, { status: 201 });
  } catch (error) {
    console.error("Activities POST error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
