"use client";

import { Bell, Search } from "lucide-react";

export function TopBar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: "200px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        zIndex: 30,
      }}
    >
      {/* Page title area — can be customized per page */}
      <div />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          style={{
            padding: "8px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search size={16} />
        </button>
        <button
          style={{
            padding: "8px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
            }}
          />
        </button>
      </div>
    </header>
  );
}
