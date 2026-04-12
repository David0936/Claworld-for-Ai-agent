"use client";

import { useEffect, useState } from "react";
import { Info, Settings, HardDrive, FolderOpen, Activity, Zap } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useI18n } from "@/i18n/context";

export default function SettingsPage() {
  const { t, lang, setLang, availableLangs } = useI18n();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/system/stats")
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {});
    fetch("/api/activities?limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setActivitiesCount(d?.total || 0))
      .catch(() => {});
  }, []);

  async function importActivities() {
    setImporting(true);
    try {
      const r = await fetch("/api/activities/migrate", { method: "POST" });
      const d = await r.json();
      setActivitiesCount(d.imported || 0);
    } catch {} finally {
      setImporting(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
          {t("settings.title")}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {t("settings.subtitle")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>

        {/* Language Settings */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Zap size={16} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("settings.language")}
            </h3>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
            {t("settings.languageSub")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            {availableLangs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as typeof lang)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: lang === l.code ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  background: lang === l.code ? "var(--accent-soft)" : "var(--surface-elevated)",
                  color: lang === l.code ? "var(--accent)" : "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: lang === l.code ? 600 : 400,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "20px" }}>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && (
                  <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Info */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Info size={16} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("settings.agentInfo")}
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: t("settings.name"), value: BRANDING.agentName, span: true },
              { label: t("settings.emoji"), value: BRANDING.agentEmoji },
              { label: t("settings.company"), value: BRANDING.companyName },
              { label: t("settings.app"), value: BRANDING.appTitle },
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
              {t("settings.systemResources")}
            </h3>
          </div>
          {stats ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{t("settings.cpu")}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{(stats.cpu as { usage: number })?.usage?.toFixed(0)}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{(stats.cpu as { cores: number })?.cores} {t("settings.cores")}</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{t("settings.memory")}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{(stats.memory as { usedPercent: number })?.usedPercent?.toFixed(0)}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{formatBytes((stats.memory as { used: number })?.used || 0)}</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface-elevated)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{t("settings.uptime")}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{formatUptime((stats.uptime as number) || 0)}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>system</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t("common.loading")}</div>
          )}
        </div>

        {/* Activity Data */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Activity size={16} style={{ color: "var(--warning)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("settings.activityData")}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                {activitiesCount.toLocaleString()} {t("settings.activityCount")}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                {t("settings.fromSessions")}
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
              {importing ? t("settings.importing") : t("settings.importFromSessions")}
            </button>
          </div>
        </div>

        {/* Environment */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Settings size={16} style={{ color: "var(--info)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("settings.env")}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "OPENCLAW_DIR", value: "~/.openclaw" },
              { label: "WORKSPACE", value: "~/.openclaw/workspace" },
              { label: "NEXT_PUBLIC_APP_TITLE", value: BRANDING.appTitle },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-elevated)", fontSize: "11px" }}>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{item.label}</span>
                <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Configure via <code style={{ background: "var(--surface)", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }}>.env.local</code>.
          </p>
        </div>

        {/* About */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Zap size={16} style={{ color: "var(--positive)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("settings.about")}
            </h3>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <p><strong style={{ color: "var(--text-primary)" }}>Claworld</strong> — AI Agent Visualization Dashboard</p>
            <p style={{ marginTop: "4px" }}>{t("settings.aboutBuiltWith")}</p>
            <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
              {t("settings.aboutPoweredBy")} · {BRANDING.agentName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
