"use client";

import { useEffect, useState, useCallback } from "react";
import { ActivityFeed, type Activity } from "@/components/ActivityFeed";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { Search, Filter, RefreshCw } from "lucide-react";

const TYPES = ["file", "search", "message", "command", "cron", "security", "build"];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 30;

  const fetchActivities = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(page * limit),
      days: "30",
    });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);

    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, fetchActivities]);

  const totalPages = Math.ceil(total / limit);

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
          Activity Log
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          最近 30 天的活动记录 · 共 {total} 条
        </p>
        <button
          onClick={async () => {
            try {
              const r = await fetch("/api/activities/migrate", { method: "POST" });
              const d = await r.json();
              if (d.imported > 0) {
                fetchActivities();
              }
            } catch {}
          }}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Import Sessions
        </button>
      </div>

      {/* Activity Heatmap */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            活动趋势
          </span>
        </div>
        <ActivityHeatmap days={30} />
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            position: "relative",
            flex: "1 1 200px",
            maxWidth: "400px",
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            className="input"
            placeholder="搜索活动..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>

        {/* Type filter */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setTypeFilter("")}
            className="badge"
            style={{
              backgroundColor: !typeFilter
                ? "var(--accent-soft)"
                : "var(--surface-elevated)",
              color: !typeFilter ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              border: "none",
              fontSize: "11px",
            }}
          >
            All
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(typeFilter === t ? "" : t);
                setPage(0);
              }}
              className="badge"
              style={{
                backgroundColor:
                  typeFilter === t ? "var(--accent-soft)" : "var(--surface-elevated)",
                color:
                  typeFilter === t ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
                border: "none",
                fontSize: "11px",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          加载中...
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          没有找到匹配的活动记录
        </div>
      ) : (
        <>
          <ActivityFeed activities={activities} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              <button
                className="btn-outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn-outline"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
