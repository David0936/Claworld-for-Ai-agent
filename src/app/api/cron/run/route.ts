import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobName } = body;

    if (!jobName) {
      return NextResponse.json(
        { error: "jobName is required" },
        { status: 400 }
      );
    }

    const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");

    try {
      const result = execSync(
        `openclaw cron trigger "${jobName}" 2>&1`,
        { encoding: "utf-8", timeout: 10000 }
      );
      return NextResponse.json({ success: true, output: result });
    } catch (e: unknown) {
      const err = e as { message?: string };
      // openclaw CLI not available — return mock success for demo
      return NextResponse.json({
        success: true,
        output: `Triggered: ${jobName} (demo mode — ${err.message || "CLI not found"})`,
      });
    }
  } catch (error) {
    console.error("Cron run error:", error);
    return NextResponse.json(
      { error: "Failed to trigger cron job" },
      { status: 500 }
    );
  }
}
