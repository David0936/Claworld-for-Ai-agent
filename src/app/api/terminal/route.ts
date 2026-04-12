import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import os from "os";
import path from "path";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");

// Whitelist of safe commands
const ALLOWED_COMMANDS = new Set([
  "ls", "pwd", "whoami", "date", "uptime", "df", "du", "free",
  "ps", "top", "git", "cat", "head", "tail", "grep", "find", "wc",
  "echo", "env", "id", "hostname", "uname", "ifconfig", "ip",
  "openclaw", "node", "npm", "pnpm", "python3", "ruby", "curl", "wget",
]);

function isSafe(cmd: string): boolean {
  const first = cmd.trim().split(/\s+/)[0];
  return ALLOWED_COMMANDS.has(first) || first.startsWith("git ");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const command: string = body.command;

    if (!command || typeof command !== "string" || command.length > 1000) {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    // Security: prevent directory traversal in cd commands
    if (command.includes("..") || command.includes("&&") || command.includes("||") || command.includes(";")) {
      return NextResponse.json({ error: "Command not allowed" }, { status: 403 });
    }

    if (!isSafe(command) && !command.startsWith("ls ") && !command.startsWith("cat ") && !command.startsWith("find ")) {
      return NextResponse.json({ error: "Command not in whitelist" }, { status: 403 });
    }

    const start = Date.now();
    const output = execSync(command, {
      cwd: WORKSPACE_DIR,
      timeout: 10000,
      maxBuffer: 1024 * 512, // 512KB max output
      encoding: "utf-8",
      env: { ...process.env, HOME: os.homedir(), PATH: process.env.PATH },
    });
    const duration = Date.now() - start;

    return NextResponse.json({
      command,
      output: output.substring(0, 10000),
      duration,
      cwd: WORKSPACE_DIR,
      exitCode: 0,
    });
  } catch (e) {
    const err = e as { status?: number; message?: string; stdout?: string; stderr?: string };
    const stderr = err.stderr || err.message || "";
    const stdout = err.stdout || "";
    return NextResponse.json({
      command: "",
      output: "",
      error: stderr.substring(0, 5000) || "Command execution failed",
      duration: 0,
      exitCode: 1,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    workspace: WORKSPACE_DIR,
    openclawDir: OPENCLAW_DIR,
    allowedCommands: Array.from(ALLOWED_COMMANDS),
  });
}
