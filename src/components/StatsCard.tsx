"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconColor = "var(--accent)",
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </span>
        <span style={{ color: iconColor, display: "flex" }}>{icon}</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-1.5px",
            color: "var(--text-primary)",
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: trend.isPositive ? "var(--positive)" : "var(--negative)",
            }}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
