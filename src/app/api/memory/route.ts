import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET() {
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const workspaceDir = path.join(OPENCLAW_DIR, "workspace");
  const memoryDir = path.join(workspaceDir, "memory");

  interface MemoryFile {
    name: string;
    path: string;
    size: number;
    modified: string;
    preview: string;
  }

  const files: MemoryFile[] = [];

  function readMemoryFiles(dir: string) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile()) {
          const ext = entry.name.split(".").pop()?.toLowerCase();
          if (!["md", "txt"].includes(ext || "")) continue;
          try {
            const stat = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, "utf-8");
            // Get first non-header, non-empty line as preview
            const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
            const preview = lines.slice(0, 3).join(" ").substring(0, 150).trim();
            files.push({
              name: entry.name,
              path: path.relative(workspaceDir, fullPath),
              size: stat.size,
              modified: stat.mtime.toISOString(),
              preview: preview || "No content",
            });
          } catch {}
        } else if (entry.isDirectory() && entry.name !== "node_modules") {
          readMemoryFiles(fullPath);
        }
      }
    } catch {}
  }

  readMemoryFiles(memoryDir);
  // Also read root memory files
  const rootEntries = fs.readdirSync(workspaceDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.name.startsWith("MEMORY") && (entry.name.endsWith(".md") || entry.name.endsWith(".txt"))) {
      try {
        const fullPath = path.join(workspaceDir, entry.name);
        const stat = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
        const preview = lines.slice(0, 3).join(" ").substring(0, 150).trim();
        files.push({
          name: entry.name,
          path: entry.name,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          preview: preview || "No content",
        });
      } catch {}
    }
  }

  return NextResponse.json({ files, total: files.length });
}
