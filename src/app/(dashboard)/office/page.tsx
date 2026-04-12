"use client";

import { useEffect, useState } from "react";
import PixelOffice from "@/components/PixelOffice";

interface Agent {
  id: string;
  name: string;
  status: "online" | "busy" | "idle" | "offline";
  emoji?: string;
  avatar?: string;
  color: string;
}

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => { setAgents(d.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
        Loading office...
      </div>
    );
  }

  // Map agents to office display (fill with default empty agents for vacant desks)
  const officeAgents = agents.length > 0 ? agents : [
    { id: "empty-1", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-2", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-3", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-4", name: "—", status: "offline" as const, color: "#333" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Pixel Office
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {agents.length} agents · {agents.filter((a) => a.status === "online" || a.status === "busy").length} active · Click an agent to see details
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <a href="/agents" style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            Manage Agents
          </a>
        </div>
      </div>

      {/* Pixel Office Canvas */}
      <div style={{ marginBottom: "16px" }}>
        <PixelOffice agents={officeAgents} width={800} height={480} />
      </div>

      {/* Agent status legend */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "4px" }}>Status:</span>
          {[
            { status: "online", label: "Online", color: "#00ff88" },
            { status: "busy", label: "Busy", color: "#ff6b6b" },
            { status: "idle", label: "Idle", color: "#ffd93d" },
            { status: "offline", label: "Offline", color: "#555" },
          ].map(({ status, label, color }) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "999px", background: "var(--surface)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
