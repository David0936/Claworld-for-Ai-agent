import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET() {
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");

  function run(cmd: string, cwd = WORKSPACE_DIR): string {
    try {
      return execSync(cmd, { cwd, timeout: 5000 }).toString().trim();
    } catch (e) {
      const err = e as { message?: string; stderr?: Buffer };
      return err.stderr?.toString().trim() || err.message || "";
    }
  }

  const isGitRepo = fs.existsSync(path.join(WORKSPACE_DIR, ".git"));

  if (!isGitRepo) {
    return NextResponse.json({
      isRepo: false,
      message: "Not a git repository",
      workspace: WORKSPACE_DIR,
    });
  }

  try {
    // Status
    const status = run("git status --porcelain");
    const branch = run("git branch --show-current");
    const remote = run("git remote get-url origin 2>/dev/null") || null;

    // Last commit
    const lastCommit = run("git log -1 --format='%H|%an|%ae|%ai|%s'");
    const [commitHash, authorName, authorEmail, commitDate, commitMessage] = lastCommit.split("|");

    // Recent commits
    const recentCommitsRaw = run("git log --oneline -10");
    const recentCommits = recentCommitsRaw.split("\n").map((line) => {
      const [hash, ...msgParts] = line.split(" ");
      return { hash, message: msgParts.join(" "), short: hash.substring(0, 7) };
    });

    // Staged / unstaged changes
    const staged = run("git diff --cached --stat");
    const ahead = run("git rev-list --count @{u}..HEAD 2>/dev/null") || "0";
    const behind = run("git rev-list --count HEAD..@{u} 2>/dev/null") || "0";

    return NextResponse.json({
      isRepo: true,
      branch,
      remote,
      status: status || "(clean)",
      ahead: parseInt(ahead) || 0,
      behind: parseInt(behind) || 0,
      lastCommit: commitHash ? {
        hash: commitHash,
        short: commitHash.substring(0, 7),
        authorName,
        authorEmail,
        date: commitDate,
        message: commitMessage,
      } : null,
      recentCommits,
      workspace: WORKSPACE_DIR,
    });
  } catch (error) {
    return NextResponse.json({
      isRepo: true,
      error: String(error),
    });
  }
}
