"use client";

import { useEffect, useState } from "react";
import PixelOffice from "@/components/PixelOffice";
import Link from "next/link";
import { Users, ShoppingBag, Copy, Check } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "online" | "busy" | "idle" | "offline";
  emoji?: string;
  avatar?: string;
  color: string;
}

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || "https://shop.claworld.ai";

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then((r) => r.json()).catch(() => ({ agents: [] })),
      fetch("/api/tenants").then((r) => r.json()).catch(() => ({ tenants: [] })),
    ]).then(([agentData, tenantData]) => {
      setAgents(agentData.agents || []);
      // Get first room's invite code
      if (tenantData.tenants?.length > 0) {
        setInviteCode(tenantData.tenants[0].inviteCode);
      }
      setLoading(false);
    });
  }, []);

  function copyInvite() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    });
  }

  if (loading) {
    return (
      <div style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
        Loading office...
      </div>
    );
  }

  const officeAgents = agents.length > 0 ? agents : [
    { id: "empty-1", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-2", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-3", name: "—", status: "offline" as const, color: "#333" },
    { id: "empty-4", name: "—", status: "offline" as const, color: "#333" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            Pixel Office
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {agents.length} agents · {agents.filter((a) => a.status === "online" || a.status === "busy").length} active
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Invite Friends */}
          {inviteCode ? (
            <button
              onClick={copyInvite}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: copiedInvite ? "var(--positive-soft)" : "var(--surface)",
                color: copiedInvite ? "var(--positive)" : "var(--text-secondary)",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copiedInvite ? <Check size={13} /> : <Copy size={13} />}
              {copiedInvite ? "Copied!" : "Invite Code"}
              <code style={{ fontFamily: "var(--font-mono)", marginLeft: "4px", fontSize: "11px", color: "var(--accent)" }}>
                {inviteCode}
              </code>
            </button>
          ) : (
            <Link
              href="/tenants"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text-secondary)",
                fontSize: "12px", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Users size={13} /> Invite Friends
            </Link>
          )}

          {/* Claworld Shop */}
          <a
            href="/shop"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "var(--radius-md)",
              border: "1px solid rgba(0,212,170,0.3)", background: "var(--accent-soft)",
              color: "var(--accent)",
              fontSize: "12px", fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ShoppingBag size={13} /> Shop Skins
          </a>

          {/* Manage Agents */}
          <Link
            href="/agents"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text-secondary)",
              fontSize: "12px", fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Users size={13} /> Manage
          </Link>
        </div>
      </div>

      {/* Pixel Office Canvas */}
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
        <PixelOffice agents={officeAgents} />
      </div>

      {/* Bottom panel: Tenants + Legend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px" }}>
        {/* Agent legend */}
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "4px" }}>Status:</span>
            {[
              { status: "online", label: "Online", color: "#00ff88" },
              { status: "busy", label: "Busy", color: "#ff6b6b" },
              { status: "idle", label: "Idle", color: "#ffd93d" },
              { status: "offline", label: "Offline", color: "#555" },
            ].map(({ status, label, color }) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "999px", background: "var(--surface)" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/tenants" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11px", textDecoration: "none" }}>
            <Users size={11} /> Tenants
          </Link>
          <Link href="/shop" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11px", textDecoration: "none" }}>
            <ShoppingBag size={11} /> Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
