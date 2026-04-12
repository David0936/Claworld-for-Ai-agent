"use client";

import { CheckCircle, XCircle, Clock, Play, Calendar } from "lucide-react";

interface CronJob {
  name: string;
  enabled: boolean;
  kind: string;
  expr: string;
  lastRunAtMs: number | null;
  nextRunAtMs: number | null;
  totalRuns: number;
  totalFailures: number;
}

interface CronJobCardProps {
  job: CronJob;
  onTrigger?: (name: string) => void;
}

function formatSchedule(kind: string, expr: string): string {
  if (kind === "cron" && expr) return `Cron: ${expr}`;
  if (kind === "every" && expr) return `Every: ${expr}`;
  if (kind === "at" && expr) return `At: ${expr}`;
  return expr || "Unknown";
}

function formatTimestamp(ms: number | null): string {
  if (!ms) return "Never";
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ms: number | null): string {
  if (!ms) return "Never";
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CronJobCard({ job, onTrigger }: CronJobCardProps) {
  const didRunRecently =
    job.lastRunAtMs && Date.now() - job.lastRunAtMs < 86400000;

  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {job.enabled ? (
            <CheckCircle
              size={16}
              style={{ color: "var(--positive)", flexShrink: 0 }}
            />
          ) : (
            <XCircle
              size={16}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
          )}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "14px",
                fontWeight: 600,
                color: job.enabled
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              }}
            >
              {job.name}
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatSchedule(job.kind, job.expr)}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="badge"
          style={{
            backgroundColor: job.enabled
              ? "var(--positive-soft)"
              : "var(--surface-elevated)",
            color: job.enabled ? "var(--positive)" : "var(--text-muted)",
          }}
        >
          {job.enabled ? "Active" : "Disabled"}
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            LAST RUN
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {timeAgo(job.lastRunAtMs)}
          </span>
        </div>

        <div
          style={{
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            NEXT RUN
          </span>
          <span
            style={{
              fontSize: "11px",
              color:
                job.nextRunAtMs && job.nextRunAtMs < Date.now()
                  ? "var(--warning)"
                  : "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {job.nextRunAtMs
              ? formatTimestamp(job.nextRunAtMs)
              : "—"}
          </span>
        </div>

        <div
          style={{
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            RUNS / FAILURES
          </span>
          <span
            style={{
              fontSize: "11px",
              color:
                job.totalFailures > 0 ? "var(--negative)" : "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {job.totalRuns}
            {job.totalFailures > 0 && (
              <span style={{ color: "var(--negative)" }}>
                {" "}
                / {job.totalFailures} fail
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      {onTrigger && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-outline"
            onClick={() => onTrigger(job.name)}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: "12px",
            }}
          >
            <Play size={12} />
            Trigger Now
          </button>
        </div>
      )}
    </div>
  );
}
