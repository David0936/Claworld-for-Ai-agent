import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const COSTS_DIR = path.join(OPENCLAW_DIR, "costs");

// Generate mock cost data since OpenClaw doesn't have built-in cost tracking
function getMockCostData() {
  const now = new Date();
  const data = [];
  let total = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const amount = Math.round(Math.random() * 50 + 10) / 100;
    total += amount;
    data.push({ date: dayStr, cost: amount, requests: Math.floor(Math.random() * 200 + 20) });
  }

  return {
    daily: data,
    total: Math.round(total * 100) / 100,
    avgPerDay: Math.round((total / 30) * 100) / 100,
    currency: "USD",
  };
}

export async function GET() {
  try {
    // Try to read real cost data from OpenClaw costs directory
    if (fs.existsSync(COSTS_DIR)) {
      const files = fs.readdirSync(COSTS_DIR).filter((f) => f.endsWith(".json"));
      if (files.length > 0) {
        // Read the most recent file
        const latest = files.sort().pop()!;
        const content = fs.readFileSync(path.join(COSTS_DIR, latest), "utf-8");
        return NextResponse.json(JSON.parse(content));
      }
    }
  } catch {
    // Fall through to mock
  }

  // Return mock data
  return NextResponse.json(getMockCostData());
}
