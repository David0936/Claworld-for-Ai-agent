"use client";

import { useEffect, useState } from "react";
import { GitBranch, GitCommit, GitPullRequest, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface GitData {
  isRepo: boolean;
  workspace?: string;
  branch?: string;
  remote?: string;
  status?: string;
  ahead?: number;
  behind?: number;
  lastCommit?: {
    hash: string;
    short: string;
    authorName: string;
    authorEmail: string;
    date: string;
    message: string;
  };
  recentCommits?: Array<{ hash: string; short: string; message: string }>;
  error?: string;
}

export default function GitPage() {
  const [data, setData] = useState<GitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/git")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;
  }

  if (!data) {
    return <div style={{ color: "var(--negative)", padding: "40px" }}>Failed to load git data</div>;
  }

  if (!data.isRepo) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
          Git Status
        </h1>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px" }}>
          <AlertCircle size={24} style={{ color: "var(--warning)" }} />
          <div>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>Not a Git Repository</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{data.workspace || "Workspace"} is not initialized as a git repository.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
          Git Status
        </h1>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Branch info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <GitBranch size={20} style={{ color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Branch</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{data.branch}</div>
          </div>
        </div>
        {data.remote && (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GitPullRequest size={20} style={{ color: "var(--info)" }} />
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remote</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{data.remote}</div>
            </div>
          </div>
        )}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {data.status === "(clean)" ? (
            <CheckCircle2 size={20} style={{ color: "var(--positive)" }} />
          ) : (
            <AlertCircle size={20} style={{ color: "var(--warning)" }} />
          )}
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: data.status === "(clean)" ? "var(--positive)" : "var(--warning)" }}>
              {data.status === "(clean)" ? "Clean" : "Modified"}
            </div>
          </div>
        </div>
      </div>

      {/* Sync status */}
      {((data.ahead ?? 0) > 0 || (data.behind ?? 0) > 0) && (
        <div className="card" style={{ marginBottom: "20px", display: "flex", gap: "16px", padding: "16px" }}>
          {(data.ahead ?? 0) > 0 && (
            <span style={{ fontSize: "12px", color: "var(--info)" }}>↑ {data.ahead} commit{(data.ahead ?? 0) > 1 ? "s" : ""} ahead</span>
          )}
          {(data.behind ?? 0) > 0 && (
            <span style={{ fontSize: "12px", color: "var(--warning)" }}>↓ {data.behind} commit{(data.behind ?? 0) > 1 ? "s" : ""} behind</span>
          )}
        </div>
      )}

      {/* Last commit */}
      {data.lastCommit && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <GitCommit size={14} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Last Commit</h3>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <code style={{ fontSize: "11px", background: "var(--surface)", padding: "3px 8px", borderRadius: "4px", color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {data.lastCommit.short}
            </code>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                {data.lastCommit.message}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {data.lastCommit.authorName} · {new Date(data.lastCommit.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent commits */}
      {data.recentCommits && data.recentCommits.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <GitCommit size={14} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Recent Commits</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.recentCommits.map((commit) => (
              <div key={commit.hash} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <code style={{ fontSize: "10px", background: "var(--surface)", padding: "2px 6px", borderRadius: "3px", color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0, marginTop: "2px" }}>
                  {commit.short}
                </code>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {commit.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
