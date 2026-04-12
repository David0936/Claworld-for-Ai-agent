"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Timer,
  Puzzle,
  FolderOpen,
  DollarSign,
  Settings,
  ChevronRight,
  Menu,
  Search,
  GitBranch,
  Brain,
  MessageSquare,
  CalendarDays,
  Terminal,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const navItems = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/activities", label: "活动", icon: Activity },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/cron", label: "定时", icon: Timer },
  { href: "/skills", label: "Skills", icon: Puzzle },
  { href: "/files", label: "文件", icon: FolderOpen },
  { href: "/git", label: "Git", icon: GitBranch },
  { href: "/memory", label: "记忆", icon: Brain },
  { href: "/costs", label: "成本", icon: DollarSign },
  { href: "/calendar", label: "日历", icon: CalendarDays },
  { href: "/terminal", label: "终端", icon: Terminal },
  { href: "/sessions", label: "会话", icon: MessageSquare },
];

export function Dock() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll on mobile when open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className="dock-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
        />
      )}

      {/* Dock */}
      <nav
        className="dock"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: isMobile ? undefined : "200px",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          padding: isMobile ? "12px 8px" : "20px 12px",
          backgroundColor: "var(--surface)",
          borderRight: isMobile ? "none" : "1px solid var(--border)",
          borderBottom: isMobile ? "1px solid var(--border)" : "none",
          zIndex: 50,
          gap: isMobile ? "4px" : "4px",
          overflow: isMobile ? "auto" : undefined,
          ...(isMobile
            ? {
                bottom: 0,
                left: 0,
                right: 0,
                top: "auto",
                width: "100%",
                height: "auto",
                flexDirection: "row",
                justifyContent: "center",
              }
            : {}),
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: isMobile ? "6px 8px" : "8px 10px",
            marginBottom: isMobile ? "0" : "8px",
          }}
        >
          <img
            src="/branding/logo-light.png"
            alt="Claworld"
            style={{ height: "28px", width: "auto", objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              // Fallback: show emoji
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const emoji = document.createElement("span");
                emoji.textContent = "🐟";
                emoji.style.fontSize = "20px";
                parent.prepend(emoji);
              }
            }}
          />
        </div>

        {!isMobile && (
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--border)",
              marginBottom: "8px",
            }}
          />
        )}

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="dock-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: isMobile ? "10px" : "10px 12px",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: "13px",
                textDecoration: "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                justifyContent: isMobile ? "center" : "flex-start",
                minWidth: isMobile ? "52px" : undefined,
              }}
            >
              <Icon size={18} />
              {!isMobile && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!isMobile && (
          <div
            style={{
              marginTop: "auto",
              paddingTop: "12px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                fontSize: "10px",
                color: "var(--text-muted)",
              }}
            >
              Claworld v0.1.0
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .dock-item:hover:not(.active) {
          background-color: var(--surface-elevated) !important;
          color: var(--text-primary) !important;
        }
        .dock-mobile-toggle {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 60;
          padding: 8px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}
