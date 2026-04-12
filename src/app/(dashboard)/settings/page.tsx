"use client";

import { useEffect, useState } from "react";
import { Info, Settings, HardDrive, FolderOpen, Activity, Zap } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function SettingsPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    // Load system stats
    fetch("/api/system/stats")
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {});

    // Load activity count
    fetch("/api/activities?limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setActivitiesCount(d?.total || 0))
      .catch(() => {});
  }, []);

  async function importActivities() {
    setImporting(true);
    try {
      const r = await fetch("/api/activities/migrate", { method: "POST" });
      const result = await r.json();
      setActivitiesCount(result.imported || 0);
      alert(`Imported ${result.imported} activities`);
    } catch {
      alert("Migration failed");
    } finally {
      setImporting(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Agent configuration and system info
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>

        {/* Agent Info */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Info size={16} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Agent Info
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Name", value: BRANDING.agentName, span: true },
              { label: "Emoji", value: BRANDING.agentEmoji },
              { label: "Company", value: BRANDING.companyName },
              { label: "App", value: BRANDING.appTitle },
            ].map((item) => (
              <div key={item.label} style={{ gridColumn: item.span ? "1 / -1" : undefined, padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <HardDrive size={16} style={{ color: "var(--info)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              System Resources
            </h3>
          </div>
          {stats ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>CPU</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{(stats.cpu as { usage: number })?.usage?.toFixed(0)}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{(stats.cpu as { cores: number })?.cores} cores</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>Memory</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{(stats.memory as { usedPercent: number })?.usedPercent?.toFixed(0)}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{formatBytes((stats.memory as { used: number })?.used || 0)}</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>Uptime</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{formatUptime((stats.uptime as number) || 0)}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>system</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading...</div>
          )}
        </div>

        {/* Data Management */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Activity size={16} style={{ color: "var(--warning)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Activity Data
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                {activitiesCount.toLocaleString()} activities logged
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                From OpenClaw session history
              </div>
            </div>
            <button
              onClick={importActivities}
              disabled={importing}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: importing ? "var(--surface-elevated)" : "var(--accent-soft)",
                color: importing ? "var(--text-muted)" : "var(--accent)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: importing ? "not-allowed" : "pointer",
              }}
            >
              {importing ? "Importing..." : "Import from Sessions"}
            </button>
          </div>
        </div>

        {/* Environment */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Settings size={16} style={{ color: "var(--info)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Environment
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "OPENCLAW_DIR", value: "~/.openclaw" },
              { label: "WORKSPACE", value: "~/.openclaw/workspace" },
              { label: "DATA_DIR", value: "~/.openclaw/workspace/.claworld" },
              { label: "NEXT_PUBLIC_APP_TITLE", value: BRANDING.appTitle },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-elevated)", fontSize: "11px" }}>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{item.label}</span>
                <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Configure via <code style={{ background: "var(--surface)", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }}>.env.local</code>. See <code style={{ background: "var(--surface)", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }}>.env.example</code>.
          </p>
        </div>

        {/* About */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Zap size={16} style={{ color: "var(--positive)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              About Claworld
            </h3>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <p><strong style={{ color: "var(--text-primary)" }}>Claworld</strong> — AI Agent Visualization Dashboard</p>
            <p style={{ marginTop: "4px" }}>Built with Next.js · TypeScript · Tailwind CSS v4 · SQLite</p>
            <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
              Powered by OpenClaw · {BRANDING.agentName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
