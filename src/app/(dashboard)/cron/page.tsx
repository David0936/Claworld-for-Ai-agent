"use client";

import { useEffect, useState, useCallback } from "react";
import { CronJobCard } from "@/components/CronJobCard";
import { Timer, RefreshCw } from "lucide-react";

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

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleTrigger = async (name: string) => {
    setTriggering(name);
    try {
      await fetch("/api/cron/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobName: name }),
      });
      // Refresh after short delay
      setTimeout(fetchJobs, 1000);
    } finally {
      setTriggering(null);
    }
  };

  const enabled = jobs.filter((j) => j.enabled);
  const disabled = jobs.filter((j) => !j.enabled);
  const failures = jobs.filter((j) => j.totalFailures > 0).length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
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
            Cron Jobs
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {enabled.length} active · {jobs.length} total
            {failures > 0 && (
              <span style={{ color: "var(--negative)", marginLeft: "8px" }}>
                · {failures} with failures
              </span>
            )}
          </p>
        </div>

        <button
          className="btn-outline"
          onClick={fetchJobs}
          style={{ padding: "8px 14px", fontSize: "12px" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          加载中...
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          <Timer size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px", marginBottom: "8px" }}>
            No cron jobs configured
          </p>
          <p style={{ fontSize: "12px" }}>
            Add cron jobs via the OpenClaw CLI
          </p>
        </div>
      ) : (
        <>
          {enabled.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Active Jobs
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "12px",
                }}
              >
                {enabled.map((job) => (
                  <CronJobCard
                    key={job.name}
                    job={job}
                    onTrigger={handleTrigger}
                  />
                ))}
              </div>
            </div>
          )}

          {disabled.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Disabled Jobs
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "12px",
                }}
              >
                {disabled.map((job) => (
                  <CronJobCard key={job.name} job={job} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
