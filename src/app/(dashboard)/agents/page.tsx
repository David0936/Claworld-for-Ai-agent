"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  model: string;
  status: "online" | "busy" | "idle" | "offline";
  createdAt: string;
  tokenUsage: number;
  completedTasks: number;
  description?: string;
  color: string;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    online:  { color: "var(--positive)", bg: "var(--positive-soft)", label: "在线" },
    busy:    { color: "var(--negative)", bg: "rgba(243,139,168,0.15)", label: "忙碌" },
    idle:    { color: "var(--warning)", bg: "rgba(249,217,61,0.15)", label: "空闲" },
    offline: { color: "var(--text-muted)", bg: "var(--surface)", label: "离线" },
  };
  const c = cfg[status] || cfg.offline;
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600, padding: "2px 8px",
      borderRadius: "999px", color: c.color, background: c.bg,
    }}>
      {c.label}
    </span>
  );
}

const AVATAR_COLORS = ["#00d4aa", "#e94560", "#694489", "#f7dc6f", "#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12"];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newModel, setNewModel] = useState("gpt-4");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [newDescription, setNewDescription] = useState("");

  function loadAgents() {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => { setAgents(d.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadAgents(); }, []);

  function addAgent() {
    if (!newName.trim()) return;
    fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        model: newModel,
        description: newDescription,
        color: selectedColor,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowAdd(false);
        setNewName("");
        setNewDescription("");
        loadAgents();
      })
      .catch(console.error);
  }

  const totalTokens = agents.reduce((s, a) => s + a.tokenUsage, 0);
  const totalTasks = agents.reduce((s, a) => s + a.completedTasks, 0);
  const onlineCount = agents.filter((a) => a.status === "online" || a.status === "busy").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Agent Teams
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Manage your AI agents · {agents.length} agents · {onlineCount} active
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "var(--radius-md)",
            border: "none", background: "var(--accent)", color: "#fff",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={14} /> Add Agent
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { icon: <Bot size={16} />, label: "Total Agents", value: agents.length },
          { icon: <Zap size={16} />, label: "Active", value: onlineCount },
          { icon: <CheckCircle2 size={16} />, label: "Total Tasks", value: totalTasks },
          { icon: <Clock size={16} />, label: "Total Tokens", value: totalTokens > 1000 ? `${(totalTokens/1000).toFixed(1)}K` : totalTokens },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px" }}>
            <div style={{ color: "var(--accent)" }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      {loading ? (
        <div style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : agents.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          <Bot size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px", marginBottom: "4px" }}>No agents yet</p>
          <p style={{ fontSize: "12px" }}>Click `Add Agent` to create your first agent</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {agents.map((agent) => (
            <div key={agent.id} className="card" style={{ padding: "16px" }}>
              {/* Agent header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: agent.color + "22",
                    border: `2px solid ${agent.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", flexShrink: 0,
                  }}
                >
                  {agent.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {agent.model}
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--surface-elevated)", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{agent.completedTasks}</div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Tasks Done</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--surface-elevated)", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {agent.tokenUsage > 0 ? `${(agent.tokenUsage/1000).toFixed(1)}K` : "—"}
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Tokens Used</div>
                </div>
              </div>

              {/* Meta */}
              {agent.description && (
                <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
                  {agent.description}
                </p>
              )}
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                Created {formatDate(agent.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Agent Modal */}
      {showAdd && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "20px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: "480px", padding: "24px" }}
          >
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
              Add New Agent
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 小小鱼, Max, 财务助手"
                  style={{
                    width: "100%", padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-elevated)",
                    color: "var(--text-primary)", fontSize: "13px",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Model</label>
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-elevated)",
                    color: "var(--text-primary)", fontSize: "13px",
                    outline: "none", boxSizing: "border-box",
                  }}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="minimax-01">MiniMax-01</option>
                  <option value="custom">Custom...</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Avatar Color</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: c, border: selectedColor === c ? "3px solid #fff" : "2px solid transparent",
                        cursor: "pointer", outline: selectedColor === c ? `2px solid ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  rows={2}
                  style={{
                    width: "100%", padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-elevated)",
                    color: "var(--text-primary)", fontSize: "13px",
                    outline: "none", boxSizing: "border-box", resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={addAgent}
                  disabled={!newName.trim()}
                  style={{
                    padding: "8px 20px", borderRadius: "var(--radius-md)",
                    border: "none", background: newName.trim() ? "var(--accent)" : "var(--surface)",
                    color: newName.trim() ? "#fff" : "var(--text-muted)",
                    fontSize: "13px", fontWeight: 600, cursor: newName.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
