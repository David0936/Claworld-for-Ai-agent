import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { homedir } from "os";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";

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

async function invokeGateway(tool: string, args?: Record<string, unknown>) {
  const token = await getGatewayToken();
  const body: Record<string, unknown> = { tool };
  if (args) body.args = args;

  const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}`);
  const data = await res.json() as { ok?: boolean; result?: unknown; error?: unknown };
  if (!data?.ok) throw new Error("Gateway invoke failed");
  return data.result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionKey, message } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    await invokeGateway("sessions_send", {
      sessionKey: sessionKey || undefined,
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
