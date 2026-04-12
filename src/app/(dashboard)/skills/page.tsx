"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/SkillCard";
import { Puzzle, RefreshCw, Search } from "lucide-react";

interface Skill {
  name: string;
  description: string;
  triggers?: string[];
  installedAt: string;
  path: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        setSkills(data.skills || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            Skills
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {skills.length} installed skills
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: "300px", flex: 1 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            className="input"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          加载中...
        </div>
      ) : skills.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          <Puzzle
            size={40}
            style={{ margin: "0 auto 16px", opacity: 0.3 }}
          />
          <p style={{ fontSize: "14px", marginBottom: "8px" }}>
            No skills installed
          </p>
          <p style={{ fontSize: "12px" }}>
            Install skills from ClawHub or create your own
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          No skills match your search: {search}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}
        >
          {filtered.map((skill) => (
            <SkillCard key={skill.path} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
