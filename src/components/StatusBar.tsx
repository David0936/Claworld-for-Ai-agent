"use client";

import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi } from "lucide-react";
import { getAgentDisplayName } from "@/config/branding";

export function StatusBar() {
  const [time, setTime] = useState("");
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setUptime(
        new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        left: "200px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        backgroundColor: "var(--surface)",
        borderTop: "1px solid var(--border)",
        fontSize: "11px",
        color: "var(--text-muted)",
        zIndex: 30,
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Wifi size={11} style={{ color: "var(--positive)" }} />
          System Online
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Cpu size={11} />
          Normal
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <HardDrive size={11} />
          SQLite
        </span>
      </div>

      {/* Center */}
      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        {getAgentDisplayName()} · Claworld
      </span>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span>{uptime}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
          {time}
        </span>
      </div>
    </footer>
  );
}
