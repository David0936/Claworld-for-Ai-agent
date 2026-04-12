"use client";

import { useEffect, useState } from "react";
import { Activity, Timer, Puzzle, Zap, Brain, MessageSquare, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SystemInfo } from "@/components/SystemInfo";
import { ActivityFeed } from "@/components/ActivityFeed";
import { getAgentDisplayName } from "@/config/branding";
import { useI18n } from "@/i18n/context";

function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 9) return "morning";
  if (h < 12) return "lateMorning";
  if (h < 14) return "noon";
  if (h < 18) return "afternoon";
  if (h < 21) return "evening";
  return "lateNight";
}

const EMOJIS: Record<string, string> = {
  night: "🌙", morning: "🌅", lateMorning: "☀️", noon: "🍱",
  afternoon: "💪", evening: "🌇", lateNight: "🌃",
};

interface DashboardData {
  cronJobs: { total: number; enabled: number };
  skills: number;
  todayActivities: number;
  uptimeMs: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()).catch(() => null),
      fetch("/api/activities?limit=5").then((r) => r.json()).catch(() => null),
    ]).then(([dashData, actData]) => {
      if (dashData) setData(dashData);
      if (actData?.activities) setRecentActivities(actData.activities);
      setLoading(false);
    });
  }, []);

  const greetingKey = getGreetingKey();
  const greetingText = t(`dashboard.greeting.${greetingKey}` as Parameters<typeof t>[0]);

  const dateFormat: Record<string, string> = {
    "zh-CN": "en-US", "zh-TW": "en-US", "en": "en-US", "ja": "ja-JP",
  };

  return (
    <div>
      {/* Greeting Header */}
      <div
        style={{
          marginBottom: "28px",
          padding: "24px 28px",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(77,166,255,0.04))",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "32px" }}>{EMOJIS[greetingKey]}</span>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "var(--text-primary)",
                }}
              >
                {greetingText}
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {getAgentDisplayName()} ·{" "}
                {new Date().toLocaleDateString(dateFormat[lang] || "en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* System badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--positive-soft)",
              border: "1px solid rgba(0,212,170,0.2)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--positive)",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{ fontSize: "12px", fontWeight: 600, color: "var(--positive)" }}
            >
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatsCard
          title={t("dashboard.stats.todayActivities")}
          value={loading ? "—" : (data?.todayActivities ?? 0)}
          icon={<Activity size={18} />}
          iconColor="var(--info)"
          subtitle={t("dashboard.stats.recent7Days")}
        />
        <StatsCard
          title={t("dashboard.stats.cronJobs")}
          value={loading ? "—" : data ? `${data.cronJobs.enabled}/${data.cronJobs.total}` : "—"}
          icon={<Timer size={18} />}
          iconColor="var(--warning)"
          subtitle={t("dashboard.stats.cronJobsSub")}
        />
        <StatsCard
          title={t("dashboard.stats.skills")}
          value={loading ? "—" : (data?.skills ?? 0)}
          icon={<Puzzle size={18} />}
          iconColor="var(--accent)"
          subtitle={t("dashboard.stats.skillsSub")}
        />
        <StatsCard
          title={t("dashboard.stats.uptime")}
          value={data?.uptimeMs ? formatUptimeShort(data.uptimeMs) : loading ? "—" : "—"}
          icon={<Zap size={18} />}
          iconColor="var(--positive)"
          subtitle={t("dashboard.stats.uptimeSub")}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
          {t("dashboard.quickActions")}
        </h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href="/activities/migrate" onClick={async (e) => {
            e.preventDefault();
            try {
              const r = await fetch("/api/activities/migrate", { method: "POST" });
              const d = await r.json();
              alert(`Imported ${d.imported} activities`);
              window.location.reload();
            } catch { alert("Migration failed"); }
          }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            <RefreshCw size={13} /> {t("dashboard.quickActions.import")}
          </a>
          <a href="/memory" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            <Brain size={13} /> {t("dashboard.quickActions.memory")}
          </a>
          <a href="/sessions" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            <MessageSquare size={13} /> {t("dashboard.quickActions.sessions")}
          </a>
          <a href="/search" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            {t("dashboard.quickActions.search")}
          </a>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
        <SystemInfo uptimeMs={data?.uptimeMs} />

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Activity size={16} style={{ color: "var(--info)" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {t("dashboard.recentActivity")}
            </h3>
          </div>
          {recentActivities.length > 0 ? (
            <ActivityFeed activities={recentActivities} compact />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {loading ? t("common.loading") : t("dashboard.noActivity")}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function formatUptimeShort(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}
