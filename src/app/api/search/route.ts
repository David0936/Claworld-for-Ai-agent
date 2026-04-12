import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const type = searchParams.get("type") || "all"; // all | files | activities | skills

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");
  const results: Array<{
    type: string;
    title: string;
    description: string;
    path?: string;
    url?: string;
    score: number;
  }> = [];

  // Search files
  if (type === "all" || type === "files") {
    const skipDirs = new Set(["node_modules", ".git", ".next", ".claworld"]);
    function searchDir(dir: string, depth = 0) {
      if (depth > 3) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          if (skipDirs.has(entry.name)) continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            searchDir(fullPath, depth + 1);
          } else {
            const ext = entry.name.split(".").pop()?.toLowerCase() || "";
            const searchableExts = new Set(["md", "txt", "json", "ts", "js", "tsx", "jsx", "yaml", "yml", "toml", "sh", "py", "html", "css"]);
            if (!searchableExts.has(ext)) continue;
            try {
              const content = fs.readFileSync(fullPath, "utf-8").toLowerCase();
              if (content.includes(q)) {
                const relative = path.relative(WORKSPACE_DIR, fullPath);
                // Get context around match
                const idx = content.indexOf(q);
                const start = Math.max(0, idx - 40);
                const end = Math.min(content.length, idx + q.length + 40);
                const snippet = content.substring(start, end).replace(/\n/g, " ").trim();
                results.push({
                  type: "file",
                  title: entry.name,
                  description: snippet,
                  path: relative,
                  score: content.split(q).length - 1,
                });
              }
            } catch {
              // skip unreadable files
            }
          }
        }
      } catch {
        // skip inaccessible directories
      }
    }
    searchDir(WORKSPACE_DIR);
  }

  // Sort by relevance
  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    query: q,
    total: results.length,
    results: results.slice(0, 30),
  });
}
