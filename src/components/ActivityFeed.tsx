"use client";

import {
  FileCode,
  Search,
  MessageSquare,
  Terminal,
  Timer,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface Activity {
  id: number;
  type: string;
  description: string;
  metadata?: string;
  timestamp: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  file: { icon: FileCode, color: "var(--type-file)", bg: "rgba(77,166,255,0.1)" },
  search: {
    icon: Search,
    color: "var(--type-search)",
    bg: "rgba(255,179,71,0.1)",
  },
  message: {
    icon: MessageSquare,
    color: "var(--type-message)",
    bg: "rgba(0,212,170,0.1)",
  },
  command: {
    icon: Terminal,
    color: "var(--type-command)",
    bg: "rgba(183,148,244,0.1)",
  },
  cron: {
    icon: Timer,
    color: "var(--type-cron)",
    bg: "rgba(255,107,107,0.1)",
  },
  security: {
    icon: Shield,
    color: "var(--type-security)",
    bg: "rgba(255,107,107,0.1)",
  },
  build: {
    icon: Wrench,
    color: "var(--type-build)",
    bg: "rgba(255,179,71,0.1)",
  },
};

function getConfig(type: string) {
  return (
    TYPE_CONFIG[type] || {
      icon: Terminal,
      color: "var(--text-muted)",
      bg: "var(--surface-elevated)",
    }
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ActivityFeedProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityFeed({ activities, compact = false }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        暂无活动记录
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {activities.map((activity) => {
        const config = getConfig(activity.type);
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: compact ? "10px 12px" : "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                width: compact ? "30px" : "36px",
                height: compact ? "30px" : "36px",
                borderRadius: "var(--radius-md)",
                backgroundColor: config.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={compact ? 14 : 16} style={{ color: config.color }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: compact ? "12px" : "13px",
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activity.description}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: config.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {activity.type}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  {timeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
