import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");
const SKILLS_DIRS = [
  path.join(WORKSPACE_DIR, "skills"),
  path.join(OPENCLAW_DIR, "skills"),
  path.join(os.homedir(), ".agents", "skills"),
];

function readSkillMeta(skillPath: string): {
  name: string;
  description: string;
  triggers?: string[];
} {
  const skillJsonPath = path.join(skillPath, "skill.json");
  const skillMdPath = path.join(skillPath, "SKILL.md");

  try {
    if (fs.existsSync(skillJsonPath)) {
      const raw = fs.readFileSync(skillJsonPath, "utf-8");
      return JSON.parse(raw);
    }

    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, "utf-8");
      // Extract description from frontmatter description field
      const descMatch = content.match(/description:\s*(.+)/i);
      const description = descMatch
        ? descMatch[1].trim().substring(0, 200)
        : "No description";
      return {
        name: path.basename(skillPath),
        description,
      };
    }
  } catch {
    // ignore parse errors
  }

  return { name: path.basename(skillPath), description: "No description available" };
}

export async function GET() {
  try {
    const allSkills: Array<{
      name: string;
      description: string;
      triggers: string[];
      installedAt: string;
      path: string;
      source: string;
    }> = [];

    for (const skillsDir of SKILLS_DIRS) {
      if (!fs.existsSync(skillsDir)) continue;

      const skillDirs = fs.readdirSync(skillsDir).filter((d) => {
        try {
          return fs.statSync(path.join(skillsDir, d)).isDirectory();
        } catch {
          return false;
        }
      });

      for (const dir of skillDirs) {
        const skillPath = path.join(skillsDir, dir);
        const meta = readSkillMeta(skillPath);
        try {
          const stat = fs.statSync(skillPath);
          allSkills.push({
            name: meta.name,
            description: meta.description,
            triggers: meta.triggers || [],
            installedAt: stat.mtime.toISOString(),
            path: skillPath,
            source: path.basename(path.dirname(skillsDir)),
          });
        } catch {
          // skip
        }
      }
    }

    return NextResponse.json({ skills: allSkills, total: allSkills.length });
  } catch (error) {
    console.error("Skills API error:", error);
    return NextResponse.json({ skills: [], total: 0 });
  }
}
