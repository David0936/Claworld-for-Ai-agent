import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { insertActivity } from "@/lib/activities-db";

export async function POST() {
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const sessionsJsonPath = path.join(OPENCLAW_DIR, "agents", "main", "sessions", "sessions.json");

  let count = 0;

  try {
    if (!fs.existsSync(sessionsJsonPath)) {
      return NextResponse.json({ message: "No sessions found", imported: 0 });
    }

    const sessionsRaw = fs.readFileSync(sessionsJsonPath, "utf-8");
    const sessionsObj = JSON.parse(sessionsRaw);

    // sessions.json is a dict keyed by session key
    for (const [key, session] of Object.entries(sessionsObj as Record<string, unknown>)) {
      const s = session as Record<string, unknown>;
      const sessionFile = s.sessionFile as string | undefined;

      // Log the session itself as an activity
      insertActivity({
        type: "session",
        description: `Session: ${s.chatType || "direct"} · ${s.deliveryContext ? JSON.stringify(s.deliveryContext).substring(0, 50) : "no context"}`,
        metadata: JSON.stringify({
          sessionKey: key,
          updatedAt: s.updatedAt,
          chatType: s.chatType,
          deliveryContext: s.deliveryContext,
        }),
      });
      count++;

      // Read the session file (.jsonl) for message history
      if (sessionFile && fs.existsSync(sessionFile)) {
        try {
          const lines = fs.readFileSync(sessionFile, "utf-8").split("\n").filter(Boolean);
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              if (typeof entry.content === "string" && entry.content.length > 2) {
                const role = entry.role || "unknown";
                insertActivity({
                  type: role === "user" ? "message" : role === "assistant" ? "response" : "other",
                  description: entry.content.substring(0, 200),
                  metadata: JSON.stringify({ role, sessionKey: key }),
                });
                count++;
              }
              // Tool calls
              if (Array.isArray(entry.tool_calls)) {
                for (const tc of entry.tool_calls) {
                  if (tc.function?.name) {
                    insertActivity({
                      type: "tool",
                      description: `Called: ${tc.function.name}`,
                      metadata: tc.function.arguments?.substring(0, 300),
                    });
                    count++;
                  }
                }
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        } catch {
          // skip unreadable session files
        }
      }
    }

    return NextResponse.json({
      message: `Imported ${count} activities`,
      imported: count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
