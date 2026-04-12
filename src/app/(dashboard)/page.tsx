"use client";

import { useEffect, useState } from "react";
import { Activity, Timer, Puzzle, Zap, Brain, GitBranch, RefreshCw, MessageSquare } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SystemInfo } from "@/components/SystemInfo";
import { ActivityFeed } from "@/components/ActivityFeed";
import { getAgentDisplayName } from "@/config/branding";

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 6) return { text: "夜深了，注意休息", emoji: "🌙" };
  if (h < 9) return { text: "早上好！新的一天开始了", emoji: "🌅" };
  if (h < 12) return { text: "上午好！保持专注", emoji: "☀️" };
  if (h < 14) return { text: "中午好！别忘了吃午饭", emoji: "🍱" };
  if (h < 18) return { text: "下午好！继续加油", emoji: "💪" };
  if (h < 21) return { text: "傍晚好！今天做得很好", emoji: "🌇" };
  return { text: "晚上好！休息一下吧", emoji: "🌃" };
}

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

  const greeting = getGreeting();

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
            <span style={{ fontSize: "32px" }}>{greeting.emoji}</span>
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
                {greeting.text}
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {getAgentDisplayName()} ·{" "}
                {new Date().toLocaleDateString("en-US", {
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
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--positive)",
              }}
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
          title="今日活动"
          value={loading ? "—" : (data?.todayActivities ?? 0)}
          icon={<Activity size={18} />}
          iconColor="var(--info)"
          subtitle="最近24小时"
        />
        <StatsCard
          title="定时任务"
          value={
            loading
              ? "—"
              : data
              ? `${data.cronJobs.enabled}/${data.cronJobs.total}`
              : "—"
          }
          icon={<Timer size={18} />}
          iconColor="var(--warning)"
          subtitle="已启用 / 总数"
        />
        <StatsCard
          title="已安装技能"
          value={loading ? "—" : (data?.skills ?? 0)}
          icon={<Puzzle size={18} />}
          iconColor="var(--accent)"
          subtitle="可用技能"
        />
        <StatsCard
          title="系统运行"
          value={
            data?.uptimeMs
              ? formatUptimeShort(data.uptimeMs)
              : loading
              ? "—"
              : "—"
          }
          icon={<Zap size={18} />}
          iconColor="var(--positive)"
          subtitle="持续运行时间"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
          Quick Actions
        </h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href="/activities/migrate" onClick={async (e) => { e.preventDefault(); try { const r = await fetch("/api/activities/migrate", {method:"POST"}); const d = await r.json(); alert(`Imported ${d.imported} activities`); window.location.reload(); } catch { alert("Migration failed"); }}} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            <RefreshCw size={13} /> Import Sessions
          </a>
          <a href="/memory" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            <Brain size={13} /> View Memory
          </a>
          <a href="/sessions" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            <MessageSquare size={13} /> All Sessions
          </a>
          <a href="/search" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            Search
          </a>
        </div>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
        <SystemInfo uptimeMs={data?.uptimeMs} />

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <Activity size={16} style={{ color: "var(--info)" }} />
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              最近活动
            </h3>
          </div>

          {recentActivities.length > 0 ? (
            <ActivityFeed activities={recentActivities} compact />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {loading ? "加载中..." : "暂无活动记录"}
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
