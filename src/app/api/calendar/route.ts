import { NextRequest, NextResponse } from "next/server";
import os from "os";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  // Get OpenClaw cron jobs as calendar events
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const cronPath = path.join(OPENCLAW_DIR, "cron", "jobs.json");

  const events: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    type: "cron" | "session" | "system";
    description?: string;
  }> = [];

  // Parse cron jobs as calendar events
  if (fs.existsSync(cronPath)) {
    try {
      const raw = fs.readFileSync(cronPath, "utf-8");
      const jobs = JSON.parse(raw);
      if (Array.isArray(jobs)) {
        for (const job of jobs) {
          if (job.schedule || job.cron) {
            events.push({
              id: `cron-${job.id || job.name}`,
              title: `⏰ ${job.name || "Cron Job"}`,
              date: new Date().toISOString().substring(0, 10), // today
              time: job.schedule || job.cron,
              type: "cron",
              description: job.description || job.schedule || job.cron,
            });
          }
        }
      } else if (typeof jobs === "object") {
        for (const [id, job] of Object.entries(jobs)) {
          const j = job as Record<string, unknown>;
          events.push({
            id: `cron-${id}`,
            title: `⏰ ${j.name || id}`,
            date: new Date().toISOString().substring(0, 10),
            time: (j.schedule as string) || (j.cron as string),
            type: "cron",
            description: (j.description as string) || ((j.schedule as string) || (j.cron as string)),
          });
        }
      }
    } catch {}
  }

  // Add recent sessions as events
  const sessionsPath = path.join(OPENCLAW_DIR, "agents", "main", "sessions", "sessions.json");
  if (fs.existsSync(sessionsPath)) {
    try {
      const raw = fs.readFileSync(sessionsPath, "utf-8");
      const sessions = JSON.parse(raw);
      for (const [key, val] of Object.entries(sessions as Record<string, unknown>)) {
        const s = val as Record<string, unknown>;
        const updatedAt = s.updatedAt as number;
        if (updatedAt) {
          const date = new Date(updatedAt).toISOString().substring(0, 10);
          events.push({
            id: `session-${key}`,
            title: `💬 ${s.chatType === "direct" ? "Direct Chat" : s.chatType || "Session"}`,
            date,
            type: "session",
            description: `Last active: ${new Date(updatedAt).toLocaleString()}`,
          });
        }
      }
    } catch {}
  }

  return NextResponse.json({ year, month, events, total: events.length });
}
