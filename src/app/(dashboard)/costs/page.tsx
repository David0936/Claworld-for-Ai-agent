"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DollarSign, TrendingUp, Calendar, Activity } from "lucide-react";

interface CostData {
  daily: Array<{ date: string; cost: number; requests: number }>;
  total: number;
  avgPerDay: number;
  currency: string;
}

export default function CostsPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/costs")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "var(--text-muted)",
        }}
      >
        加载中...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "var(--text-muted)",
        }}
      >
        无法加载成本数据
      </div>
    );
  }

  const chartData = data.daily.map((d) => ({
    ...d,
    label: d.date.split("-").slice(1).join("/"),
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}
        >
          Cost Analysis
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          API usage costs and trends
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total (30d)
            </span>
            <DollarSign size={16} style={{ color: "var(--accent)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-1px",
              color: "var(--text-primary)",
            }}
          >
            ${data.total.toFixed(2)}
          </span>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Daily Average
            </span>
            <TrendingUp size={16} style={{ color: "var(--positive)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-1px",
              color: "var(--text-primary)",
            }}
          >
            ${data.avgPerDay.toFixed(2)}
          </span>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Requests
            </span>
            <Activity size={16} style={{ color: "var(--info)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-1px",
              color: "var(--text-primary)",
            }}
          >
            {data.daily.reduce((sum, d) => sum + d.requests, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cost chart */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <DollarSign size={16} style={{ color: "var(--accent)" }} />
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Daily Cost
          </h3>
        </div>
        <div style={{ height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={10}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
              />
              <Bar
                dataKey="cost"
                fill="var(--accent)"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Requests chart */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
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
            Daily Requests
          </h3>
        </div>
        <div style={{ height: "160px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Requests"]}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="var(--info)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
