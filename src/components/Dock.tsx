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
  Bot,
  LayoutGrid,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useI18n } from "@/i18n/context";

const NAV_ITEMS = [
  { href: "/", labelKey: "首页", labelKeyEn: "Dashboard", icon: LayoutDashboard },
  { href: "/office", labelKey: "办公室", labelKeyEn: "Office", icon: LayoutGrid },
  { href: "/shop", labelKey: "商城", labelKeyEn: "Shop", icon: ShoppingBag },
  { href: "/tenants", labelKey: "房客", labelKeyEn: "Tenants", icon: Users },
  { href: "/agents", labelKey: "团队", labelKeyEn: "Agents", icon: Bot },
  { href: "/search", labelKey: "搜索", labelKeyEn: "Search", icon: Search },
  { href: "/cron", labelKey: "定时", labelKeyEn: "Cron", icon: Timer },
  { href: "/skills", labelKey: "Skills", labelKeyEn: "Skills", icon: Puzzle },
  { href: "/files", labelKey: "文件", labelKeyEn: "Files", icon: FolderOpen },
  { href: "/git", labelKey: "Git", labelKeyEn: "Git", icon: GitBranch },
  { href: "/memory", labelKey: "记忆", labelKeyEn: "Memory", icon: Brain },
  { href: "/costs", labelKey: "成本", labelKeyEn: "Costs", icon: DollarSign },
  { href: "/calendar", labelKey: "日历", labelKeyEn: "Calendar", icon: CalendarDays },
  { href: "/terminal", labelKey: "终端", labelKeyEn: "Terminal", icon: Terminal },
  { href: "/sessions", labelKey: "会话", labelKeyEn: "Sessions", icon: MessageSquare },
  { href: "/settings", labelKey: "设置", labelKeyEn: "Settings", icon: Settings },
];

export function Dock() {
  const pathname = usePathname();
  const { lang, availableLangs } = useI18n();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const isZh = lang === "zh-CN" || lang === "zh-TW";

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <button onClick={() => setOpen(!open)} className="dock-mobile-toggle" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay */}
      {isMobile && open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      )}

      {/* Dock */}
      <nav
        className="dock"
        style={{
          position: "fixed",
          left: isMobile ? 0 : undefined,
          right: isMobile ? 0 : undefined,
          top: isMobile ? undefined : 0,
          bottom: isMobile ? 0 : undefined,
          height: "100vh",
          width: isMobile ? undefined : "200px",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          padding: isMobile ? "12px 8px" : "20px 12px",
          backgroundColor: "var(--surface)",
          borderRight: isMobile ? "none" : "1px solid var(--border)",
          borderBottom: isMobile ? "1px solid var(--border)" : "none",
          zIndex: 50,
          gap: "4px",
          overflow: isMobile ? "auto" : "hidden",
          justifyContent: isMobile ? "center" : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: isMobile ? "6px 8px" : "8px 10px", marginBottom: isMobile ? "0" : "8px" }}>
          <img
            src="/branding/logo-light.png"
            alt="Claworld"
            style={{ height: "28px", width: "auto", objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {!isMobile && (
          <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "8px" }} />
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const label = isZh ? item.labelKey : item.labelKeyEn;

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
              onClick={() => isMobile && setOpen(false)}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!isMobile && <span>{label}</span>}
              {!isMobile && isActive && <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
