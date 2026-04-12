"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Clock, Bot, Monitor } from "lucide-react";

interface Session {
  sessionKey: string;
  channel: string;
  chatType: string;
  updatedAt: string;
  model?: string;
  messageCount: number;
}

const channelLabel: Record<string, string> = {
  feishu: "飞书",
  telegram: "Telegram",
  discord: "Discord",
  whatsapp: "WhatsApp",
  signal: "Signal",
  direct: "Direct",
};

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => {
        setSessions(d.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
          Sessions
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {sessions.length} active sessions · from OpenClaw agent history
        </p>
      </div>

      {/* Sessions list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.length === 0 && (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No sessions found
          </div>
        )}
        {sessions.map((session) => (
          <div key={session.sessionKey} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                {session.channel === "feishu" ? (
                  <Bot size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
                ) : (
                  <Monitor size={16} style={{ color: "var(--info)", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {channelLabel[session.channel] || session.channel}
                    </span>
                    <span style={{
                      fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                      background: "var(--surface)", color: "var(--text-muted)",
                    }}>
                      {session.chatType}
                    </span>
                    {session.model && (
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {session.model}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.sessionKey}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                {session.messageCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                    <MessageSquare size={11} />
                    <span style={{ fontSize: "11px" }}>{session.messageCount}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                  <Clock size={11} />
                  <span style={{ fontSize: "11px" }}>{formatRelativeTime(session.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
