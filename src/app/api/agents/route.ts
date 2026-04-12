import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const AGENTS_DIR = path.join(OPENCLAW_DIR, "agents");

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  model: string;
  status: "online" | "busy" | "idle" | "offline";
  createdAt: string;
  tokenUsage: number;
  memoryFiles: string[];
  completedTasks: number;
  soul?: string;
  description?: string;
  avatar?: string; // base64 or path
  color: string;
}

function getAgentConfig(agentPath: string): Partial<Agent> {
  try {
    const configPath = path.join(agentPath, "config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch {}
  return {};
}

function getAgentStats(agentPath: string): { tokenUsage: number; completedTasks: number } {
  try {
    const statsPath = path.join(agentPath, "stats.json");
    if (fs.existsSync(statsPath)) {
      return JSON.parse(fs.readFileSync(statsPath, "utf-8"));
    }
  } catch {}
  return { tokenUsage: 0, completedTasks: 0 };
}

function listAgents(): Agent[] {
  if (!fs.existsSync(AGENTS_DIR)) return [];

  const agents: Agent[] = [];
  const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const agentPath = path.join(AGENTS_DIR, entry.name);
    const config = getAgentConfig(agentPath);
    const stats = getAgentStats(agentPath);
    const sessionsPath = path.join(agentPath, "sessions", "sessions.json");

    // Count sessions as proxy for completed tasks
    let sessionCount = 0;
    if (fs.existsSync(sessionsPath)) {
      try {
        const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
        sessionCount = Object.keys(sessions).length;
      } catch {}
    }

    agents.push({
      id: entry.name,
      name: config.name || entry.name,
      emoji: config.emoji || "🤖",
      model: config.model || "unknown",
      status: config.status || "offline",
      createdAt: config.createdAt || new Date().toISOString(),
      tokenUsage: stats.tokenUsage || 0,
      memoryFiles: config.memoryFiles || [],
      completedTasks: stats.completedTasks || sessionCount,
      soul: config.soul,
      description: config.description,
      avatar: config.avatar,
      color: config.color || "#00d4aa",
    });
  }

  return agents.sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET() {
  try {
    const agents = listAgents();
    return NextResponse.json({ agents, total: agents.length });
  } catch (error) {
    return NextResponse.json({ error: String(error), agents: [], total: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, emoji, model, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
    const agentPath = path.join(AGENTS_DIR, id);
    fs.mkdirSync(agentPath, { recursive: true });

    const agent: Agent = {
      id,
      name,
      emoji: emoji || "🤖",
      model: model || "gpt-4",
      status: "offline",
      createdAt: new Date().toISOString(),
      tokenUsage: 0,
      memoryFiles: [],
      completedTasks: 0,
      description: description || "",
      color: color || "#00d4aa",
    };

    fs.writeFileSync(
      path.join(agentPath, "config.json"),
      JSON.stringify(agent, null, 2)
    );
    fs.writeFileSync(
      path.join(agentPath, "stats.json"),
      JSON.stringify({ tokenUsage: 0, completedTasks: 0 }, null, 2)
    );

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
