"use client";

import { MessageSquare } from "lucide-react";

interface ChatButtonProps {
  unreadCount?: number;
  onClick: () => void;
}

export function ChatButton({ unreadCount, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "var(--radius-md)",
        border: "none",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
      title="打开对话面板"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-soft)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
      }}
    >
      <MessageSquare size={16} />
      {unreadCount !== undefined && unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            minWidth: "16px",
            height: "16px",
            borderRadius: "8px",
            backgroundColor: "var(--negative)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
