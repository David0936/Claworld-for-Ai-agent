import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { homedir } from "os";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const MAX_MESSAGES = 50;

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
  content?: Array<{ text?: string }>;
  details?: { messages?: unknown[] };
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

export async function GET(request: NextRequest) {
  const sessionKey = request.nextUrl.searchParams.get("sessionKey");
  if (!sessionKey) {
    return NextResponse.json({ error: "sessionKey is required" }, { status: 400 });
  }

  try {
    const result = await invokeGateway("sessions_history", {
      sessionKey,
      limit: MAX_MESSAGES,
      includeTools: false,
    }) as GatewayResult | null;

    // Messages are in result.details.messages
    const messages = (result?.details?.messages || []) as unknown[];
    return NextResponse.json({ messages, total: messages.length });
  } catch (error) {
    return NextResponse.json({ error: String(error), messages: [], total: 0 }, { status: 500 });
  }
}
