import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");

function buildTree(dirPath: string, basePath: string, maxDepth = 3, depth = 0): {
  nodes: Array<{ name: string; type: string; path: string; children?: unknown[] }>;
} {
  if (depth > maxDepth) return { nodes: [] };

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes = [];

    for (const entry of entries) {
      // Skip hidden files and common non-essential directories
      if (
        entry.name.startsWith(".") ||
        entry.name === "node_modules" ||
        entry.name === ".git"
      )
        continue;

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        const children = buildTree(fullPath, basePath, maxDepth, depth + 1);
        nodes.push({
          name: entry.name,
          type: "directory",
          path: relativePath,
          children: children.nodes,
        });
      } else {
        nodes.push({
          name: entry.name,
          type: "file",
          path: relativePath,
        });
      }
    }

    return { nodes };
  } catch {
    return { nodes: [] };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const readPath = searchParams.get("path");

  if (readPath) {
    // Read file content
    const filePath = path.join(WORKSPACE_DIR, readPath);
    try {
      // Security: prevent directory traversal
      if (!filePath.startsWith(WORKSPACE_DIR)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      const content = fs.readFileSync(filePath, "utf-8");
      return new NextResponse(content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // List directory tree
  const tree = buildTree(WORKSPACE_DIR, WORKSPACE_DIR);
  return NextResponse.json({
    tree: tree.nodes,
    workspace: WORKSPACE_DIR,
  });
}
