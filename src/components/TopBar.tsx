"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/activities": "Activity Log",
  "/search": "Search",
  "/cron": "Cron Jobs",
  "/skills": "Skills",
  "/files": "Files",
  "/costs": "Cost Analysis",
  "/git": "Git Status",
  "/memory": "Memory",
  "/sessions": "Sessions",
  "/calendar": "Calendar",
  "/terminal": "Terminal",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Claworld";

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
      {/* Page title */}
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link
          href="/search"
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
            textDecoration: "none",
            transition: "all 0.15s",
          }}
        >
          <Search size={16} />
        </Link>
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
        </button>
      </div>
    </header>
  );
}
