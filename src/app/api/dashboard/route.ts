import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function safeJson<T = Record<string, unknown>>(filePath: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return {} as T;
  }
}

function getSystemUptime(): number {
  try {
    const stat = fs.statSync(OPENCLAW_DIR);
    return Date.now() - stat.birthtimeMs;
  } catch {
    return 0;
  }
}

function getCronJobsCount(): { total: number; enabled: number } {
  try {
    const jobs = safeJson<{ jobs?: unknown[] }>(path.join(OPENCLAW_DIR, "cron", "jobs.json"));
    const arr = jobs.jobs || [];
    const enabled = (arr as Record<string, unknown>[]).filter((j) => j.enabled !== false).length;
    return { total: arr.length, enabled };
  } catch {
    return { total: 0, enabled: 0 };
  }
}

function getSkillsCount(): number {
  try {
    const skillsDir = path.join(WORKSPACE_DIR, "skills");
    return fs.readdirSync(skillsDir).filter((d) => {
      try {
        return fs.statSync(path.join(skillsDir, d)).isDirectory();
      } catch {
        return false;
      }
    }).length;
  } catch {
    return 0;
  }
}

function getTodayActivitiesCount(): number {
  try {
    const dbPath = path.join(WORKSPACE_DIR, ".claworld", "activities.db");
    if (!fs.existsSync(dbPath)) return 0;
    const Database = require("better-sqlite3");
    const db = Database(dbPath, { readonly: true });
    const today = new Date().toISOString().split("T")[0];
    const row = db.prepare("SELECT COUNT(*) as count FROM activities WHERE date(timestamp) = ?").get(today) as { count: number };
    db.close();
    return row?.count || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const uptime = getSystemUptime();
    const cron = getCronJobsCount();
    const skills = getSkillsCount();
    const todayActivities = getTodayActivitiesCount();

    return NextResponse.json({
      cronJobs: cron,
      skills,
      todayActivities,
      uptimeMs: uptime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
