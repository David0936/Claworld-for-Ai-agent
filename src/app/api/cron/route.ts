import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");

interface CronJob {
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    every?: string;
    at?: string;
  };
  state: {
    lastRunAtMs?: number;
    nextRunAtMs?: number;
    totalRuns?: number;
    totalFailures?: number;
  };
}

interface CronJobsData {
  jobs: CronJob[];
}

function safeJson<T = unknown>(filePath: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return {} as T;
  }
}

export async function GET() {
  try {
    const jobsPath = path.join(OPENCLAW_DIR, "cron", "jobs.json");
    const data = safeJson<CronJobsData>(jobsPath);
    const jobs = (data.jobs || []).map((job) => ({
      name: job.name,
      enabled: job.enabled !== false,
      kind: job.schedule?.kind || "unknown",
      expr: job.schedule?.expr || job.schedule?.every || job.schedule?.at || "",
      lastRunAtMs: job.state?.lastRunAtMs || null,
      nextRunAtMs: job.state?.nextRunAtMs || null,
      totalRuns: job.state?.totalRuns || 0,
      totalFailures: job.state?.totalFailures || 0,
    }));

    return NextResponse.json({ jobs, total: jobs.length });
  } catch (error) {
    console.error("Cron API error:", error);
    return NextResponse.json({ jobs: [], total: 0 });
  }
}
