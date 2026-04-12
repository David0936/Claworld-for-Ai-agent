"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/i18n/context";

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
  const { lang, setLang, availableLangs, t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[pathname] || "Claworld";
  const currentLang = availableLangs.find((l) => l.code === lang);
  const shortLabel = currentLang?.short || lang.toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      {/* Logo + Page title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/branding/logo-light.png"
          alt="Claworld"
          style={{ height: "28px", width: "auto", objectFit: "contain" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
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
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Language switcher */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              border: langOpen ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: langOpen ? "var(--accent-soft)" : "var(--surface)",
              color: langOpen ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "13px" }}>{currentLang?.flag}</span>
            <span>{shortLabel}</span>
          </button>

          {/* Dropdown */}
          {langOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "6px",
                minWidth: "160px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                zIndex: 100,
              }}
            >
              {availableLangs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code as typeof lang);
                    setLangOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: lang === l.code ? "var(--accent-soft)" : "transparent",
                    color: lang === l.code ? "var(--accent)" : "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: lang === l.code ? 600 : 400,
                    textAlign: "left",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (lang !== l.code) {
                      (e.target as HTMLButtonElement).style.background = "var(--surface)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (lang !== l.code) {
                      (e.target as HTMLButtonElement).style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {lang === l.code && (
                    <span style={{ fontSize: "10px", opacity: 0.6 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
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

        {/* Notifications */}
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
