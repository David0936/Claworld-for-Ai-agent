"use client";

import { Cpu, HardDrive, Clock } from "lucide-react";

interface SystemInfoProps {
  cpu?: number;
  memory?: { used: number; total: number };
  disk?: { used: number; total: number };
  uptimeMs?: number;
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function ProgressRing({
  value,
  max,
  color,
  size = 48,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--surface-elevated)"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

function getColor(pct: number): string {
  if (pct > 85) return "var(--negative)";
  if (pct > 60) return "var(--warning)";
  return "var(--positive)";
}

export function SystemInfo({ cpu, memory, disk, uptimeMs }: SystemInfoProps) {
  const memPct = memory ? (memory.used / memory.total) * 100 : 0;
  const diskPct = disk ? (disk.used / disk.total) * 100 : 0;

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <Cpu size={16} style={{ color: "var(--info)" }} />
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          System Status
        </h3>
        {uptimeMs !== undefined && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "auto",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            <Clock size={11} />
            {formatUptime(uptimeMs)}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {/* CPU */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ position: "relative" }}>
            <ProgressRing
              value={cpu ?? 0}
              max={100}
              color={getColor(cpu ?? 0)}
              size={52}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {cpu !== undefined ? Math.round(cpu) : "—"}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            CPU
          </span>
        </div>

        {/* Memory */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ position: "relative" }}>
            <ProgressRing
              value={memPct}
              max={100}
              color={getColor(memPct)}
              size={52}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {memory
                ? `${Math.round(memPct)}%`
                : "—"}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            {memory
              ? `${memory.used.toFixed(0)}G / ${memory.total.toFixed(0)}G`
              : "MEM"}
          </span>
        </div>

        {/* Disk */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ position: "relative" }}>
            <ProgressRing
              value={diskPct}
              max={100}
              color={getColor(diskPct)}
              size={52}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {disk
                ? `${Math.round(diskPct)}%`
                : "—"}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            {disk
              ? `${disk.used}G / ${disk.total}G`
              : "DISK"}
          </span>
        </div>
      </div>
    </div>
  );
}
