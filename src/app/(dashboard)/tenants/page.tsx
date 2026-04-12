"use client";

import { useEffect, useState } from "react";
import {
  Users, Plus, Check, ExternalLink, Shield,
  Crown, User, Eye, RefreshCw, Clipboard
} from "lucide-react";

interface TenantMember {
  id: string;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  status: "online" | "offline" | "idle";
  color: string;
  isYou?: boolean;
}

interface TenantRoom {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdAt: string;
  createdBy: string;
  members: TenantMember[];
  maxMembers: number;
  isPublic: boolean;
  currentSkin: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown size={11} style={{ color: "#ffd700" }} />,
  admin: <Shield size={11} style={{ color: "#e94560" }} />,
  member: <User size={11} style={{ color: "var(--info)" }} />,
  viewer: <Eye size={11} style={{ color: "var(--text-muted)" }} />,
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "#ffd700",
  admin: "#e94560",
  member: "#3498db",
  viewer: "#7f8c8d",
};

const STATUS_COLORS: Record<string, string> = {
  online: "var(--positive)",
  idle: "var(--warning)",
  offline: "var(--text-muted)",
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [yourName, setYourName] = useState("");

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  function loadTenants() {
    fetch("/api/tenants")
      .then((r) => r.json())
      .then((d) => { setTenants(d.tenants || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadTenants(); }, []);

  function createRoom() {
    if (!newName || !yourName) return;
    fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: newName, description: newDesc, yourName }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.tenant) {
          setShowCreate(false);
          setNewName("");
          setNewDesc("");
          loadTenants();
        }
      })
      .catch(console.error);
  }

  function joinRoom() {
    if (!joinCode || !joinName) return;
    fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", inviteCode: joinCode, yourName: joinName }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.tenant) {
          setShowJoin(false);
          setJoinCode("");
          setJoinName("");
          loadTenants();
        } else {
          alert(d.error || "Failed to join");
        }
      })
      .catch(console.error);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  function regenerateCode(tenant: TenantRoom) {
    fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "regenerate-code", tenantId: tenant.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.inviteCode) {
          loadTenants();
        }
      })
      .catch(console.error);
  }

  if (loading) return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Tenant Rooms
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {tenants.length} rooms · Manage office members and invite friends
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowJoin(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <ExternalLink size={13} /> Join Room
          </button>
          <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} /> Create Room
          </button>
        </div>
      </div>

      {/* Tenant rooms */}
      {tenants.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <Users size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>No rooms yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Create a room or join one with an invite code</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tenants.map((tenant) => (
            <div key={tenant.id} className="card" style={{ padding: "20px" }}>
              {/* Room header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🏢
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{tenant.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{tenant.description || "No description"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>by {tenant.createdBy}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "999px", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11px" }}>
                    {tenant.members.length}/{tenant.maxMembers}
                  </span>
                </div>
              </div>

              {/* Invite code */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--surface)", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Invite Code:</span>
                <code style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "2px" }}>
                  {tenant.inviteCode}
                </code>
                <button
                  onClick={() => copyCode(tenant.inviteCode)}
                  style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-secondary)", fontSize: "11px", cursor: "pointer", marginLeft: "auto" }}
                >
                  {copiedCode === tenant.inviteCode ? <Check size={11} /> : <Clipboard size={11} />}
                  {copiedCode === tenant.inviteCode ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => regenerateCode(tenant)}
                  style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-secondary)", fontSize: "11px", cursor: "pointer" }}
                >
                  <RefreshCw size={11} /> Regenerate
                </button>
              </div>

              {/* Members */}
              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Members ({tenant.members.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {tenant.members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "var(--radius-md)",
                        background: member.isYou ? "var(--accent-soft)" : "var(--surface-elevated)",
                        border: member.isYou ? "1px solid rgba(0,212,170,0.3)" : "1px solid transparent",
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: member.color + "22",
                        border: `2px solid ${member.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", flexShrink: 0,
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {member.name}
                          {member.isYou && <span style={{ fontSize: "10px", color: "var(--accent)", marginLeft: "6px" }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          Joined {formatDate(member.joinedAt)}
                        </div>
                      </div>

                      {/* Role badge */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "2px 8px", borderRadius: "999px",
                        background: ROLE_COLORS[member.role] + "15",
                        border: `1px solid ${ROLE_COLORS[member.role]}30`,
                      }}>
                        {ROLE_ICONS[member.role]}
                        <span style={{ fontSize: "10px", fontWeight: 600, color: ROLE_COLORS[member.role] }}>
                          {ROLE_LABELS[member.role]}
                        </span>
                      </div>

                      {/* Status */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: STATUS_COLORS[member.status] }} />
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>{member.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Create Room</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Room Name *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. 安瑞科研发团队" style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</label>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Your Name *</label>
                <input value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="e.g. 小小鱼" style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                <button onClick={createRoom} disabled={!newName || !yourName} style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", border: "none", background: newName && yourName ? "var(--accent)" : "var(--surface)", color: newName && yourName ? "#fff" : "var(--text-muted)", fontSize: "13px", fontWeight: 600, cursor: newName && yourName ? "pointer" : "not-allowed" }}>Create Room</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={(e) => { if (e.target === e.currentTarget) setShowJoin(false); }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Join Room</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Invite Code *</label>
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" maxLength={8} style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--accent)", fontSize: "16px", fontFamily: "var(--font-mono)", letterSpacing: "2px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Your Name *</label>
                <input value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="e.g. 小小鱼" style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setShowJoin(false)} style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                <button onClick={joinRoom} disabled={!joinCode || !joinName} style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", border: "none", background: joinCode && joinName ? "var(--accent)" : "var(--surface)", color: joinCode && joinName ? "#fff" : "var(--text-muted)", fontSize: "13px", fontWeight: 600, cursor: joinCode && joinName ? "pointer" : "not-allowed" }}>Join Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
