import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { homedir } from "os";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const CACHE_TTL = 30_000;
let cache: { sessions: unknown[]; total: number; ts: number } | null = null;

async function getGatewayToken(): Promise<string> {
  if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    return process.env.OPENCLAW_GATEWAY_TOKEN;
  }
  try {
    const configPath = `${homedir()}/.openclaw/openclaw.json`;
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    const token = config?.gateway?.auth?.token;
    if (token) return token;
  } catch {}
  throw new Error("Gateway token not available");
}

interface GatewayResult {
  details?: { sessions?: unknown[]; count?: number };
  content?: Array<{ text?: string }>;
}

async function invokeGateway(tool: string, args?: Record<string, unknown>) {
  const token = await getGatewayToken();
  const body: Record<string, unknown> = { tool };
  if (args) body.args = args;

  const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}`);
  const data = await res.json() as { ok?: boolean; result?: GatewayResult; error?: unknown };
  if (!data?.ok) throw new Error("Gateway invoke failed");
  return data.result;
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const result = await invokeGateway("sessions_list") as GatewayResult | null;
    // Sessions are in result.details.sessions
    const sessions = (result?.details?.sessions || []) as unknown[];
    const result2 = { sessions, total: sessions.length };
    cache = { ...result2, ts: Date.now() };
    return NextResponse.json(result2);
  } catch (error) {
    return NextResponse.json({ error: String(error), sessions: [], total: 0 }, { status: 500 });
  }
}
