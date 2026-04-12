"use client";

import { Puzzle, ExternalLink } from "lucide-react";

interface Skill {
  name: string;
  description: string;
  triggers?: string[];
  installedAt: string;
  path: string;
}

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Puzzle size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {skill.name}
            </h3>
            <p
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: "2px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {skill.path.split("/").slice(-2).join("/")}
            </p>
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        {skill.description}
      </p>

      {skill.triggers && skill.triggers.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {skill.triggers.slice(0, 5).map((t) => (
            <span
              key={t}
              className="badge badge-info"
              style={{ fontSize: "9px" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
