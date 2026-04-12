import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

interface SessionSummary {
  sessionKey: string;
  channel: string;
  chatType: string;
  updatedAt: string;
  model?: string;
  messageCount: number;
}

export async function GET() {
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const sessionsPath = path.join(OPENCLAW_DIR, "agents", "main", "sessions", "sessions.json");

  if (!fs.existsSync(sessionsPath)) {
    return NextResponse.json({ sessions: [], total: 0 });
  }

  try {
    const raw = fs.readFileSync(sessionsPath, "utf-8");
    const sessionsObj = JSON.parse(raw);
    const sessions: SessionSummary[] = [];

    for (const [key, val] of Object.entries(sessionsObj as Record<string, unknown>)) {
      const s = val as Record<string, unknown>;
      const deliveryContext = s.deliveryContext as Record<string, unknown> | null;
      const sessionFile = s.sessionFile as string | undefined;

      // Count messages from the .jsonl file
      let messageCount = 0;
      if (sessionFile && fs.existsSync(sessionFile)) {
        try {
          const lines = fs.readFileSync(sessionFile, "utf-8").split("\n").filter(Boolean);
          messageCount = lines.length;
        } catch {}
      }

      sessions.push({
        sessionKey: key,
        channel: deliveryContext?.channel as string || "unknown",
        chatType: s.chatType as string || "direct",
        updatedAt: s.updatedAt ? new Date(s.updatedAt as number).toISOString() : "",
        model: (s.compactMetadata as Record<string, unknown>)?.model as string || undefined,
        messageCount,
      });
    }

    // Sort by updatedAt descending
    sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    return NextResponse.json({ error: String(error), sessions: [], total: 0 }, { status: 500 });
  }
}
