import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
  const SKILL_DIRS = [
    path.join(OPENCLAW_DIR, "workspace", "skills"),
    path.join(OPENCLAW_DIR, "skills"),
    path.join(os.homedir(), ".agents", "skills"),
  ];

  for (const dir of SKILL_DIRS) {
    const skillPath = path.join(dir, name);
    const skillMdPath = path.join(skillPath, "SKILL.md");
    const skillJsonPath = path.join(skillPath, "skill.json");

    if (!fs.existsSync(skillPath)) continue;

    try {
      let meta: Record<string, unknown> = {};
      let content = "";
      let contentType = "unknown";

      if (fs.existsSync(skillJsonPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(skillJsonPath, "utf-8"));
        } catch {}
      }

      if (fs.existsSync(skillMdPath)) {
        content = fs.readFileSync(skillMdPath, "utf-8");
        contentType = "markdown";
      }

      const stat = fs.statSync(skillPath);

      return NextResponse.json({
        name,
        path: skillPath,
        meta,
        content,
        contentType,
        installedAt: stat.mtime.toISOString(),
        size: stat.size,
      });
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Skill not found" }, { status: 404 });
}
