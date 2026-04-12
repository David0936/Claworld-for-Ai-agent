"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays } from "date-fns";

interface DayData {
  day: string;
  count: number;
  opacity: number;
}

interface ActivityHeatmapProps {
  days?: number;
}

export function ActivityHeatmap({ days = 30 }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/activities/stats?days=${days}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.byDay) {
          // Fill in missing days
          const map: Record<string, number> = {};
          for (const row of res.byDay) {
            map[row.day] = row.count;
          }

          const filled: DayData[] = [];
          for (let i = days - 1; i >= 0; i--) {
            const d = format(subDays(new Date(), i), "yyyy-MM-dd");
            const count = map[d] || 0;
            filled.push({
              day: format(subDays(new Date(), i), "MM/dd"),
              count,
              opacity: count === 0 ? 0.15 : 0.3,
            });
          }
          setData(filled);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div
        style={{
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <div style={{ height: "120px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={8}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
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
            labelStyle={{ color: "var(--text-secondary)" }}
            formatter={(value: number) => [`${value} activities`, "Count"]}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]} fill="var(--accent)">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} opacity={entry.opacity} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
