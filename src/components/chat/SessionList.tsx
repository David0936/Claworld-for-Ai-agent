"use client";

import { useChatSessions, type ChatSession } from "@/hooks/useChatSessions";
import { Bot, MessageSquare } from "lucide-react";

interface SessionListProps {
  selectedKey: string | null;
  onSelect: (session: ChatSession) => void;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "刚刚";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
  } catch {
    return "";
  }
}

function getSessionLabel(session: ChatSession): string {
  // Use displayName or channel or model as label
  const displayName = session.displayName;
  if (displayName) {
    // Truncate long display names
    return displayName.length > 12 ? displayName.slice(0, 12) + "…" : displayName;
  }
  const channel = session.channel;
  if (channel) {
    const ch = channel.charAt(0).toUpperCase() + channel.slice(1);
    return ch;
  }
  if (session.model) {
    const m = session.model.split("/").pop() || session.model;
    return m.length > 10 ? m.slice(0, 10) + "…" : m;
  }
  // Fallback: derive from sessionKey
  const parts = session.sessionKey.split(":");
  return parts[parts.length - 1] || session.sessionKey.slice(0, 8);
}

export function SessionList({ selectedKey, onSelect }: SessionListProps) {
  const { sessions, loading, error } = useChatSessions();

  if (loading) {
    return (
      <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
        加载中…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px", textAlign: "center", color: "var(--negative)", fontSize: "11px" }}>
        连接失败
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
        暂无会话
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0" }}>
      {sessions.map((session) => {
        const isSelected = session.sessionKey === selectedKey;
        const label = getSessionLabel(session);
        const time = formatTime(session.updatedAt);
        const lastMsg = session.lastMessage as string | undefined;

        return (
          <button
            key={session.sessionKey}
            onClick={() => onSelect(session)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: isSelected ? "var(--accent-soft)" : "transparent",
              border: "none",
              borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-elevated)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {/* Label row */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Bot size={10} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: isSelected ? "var(--accent)" : "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {/* Last message preview */}
            {lastMsg && (
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {lastMsg}
              </span>
            )}
            {/* Time */}
            {time && (
              <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{time}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
