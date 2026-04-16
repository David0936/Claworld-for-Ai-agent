"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, Loader } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  sending?: boolean;
}

export function ChatInput({ onSend, sending }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSend(trimmed);
  }, [value, sending, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      // Auto-resize
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      }
    },
    []
  );

  return (
    <div
      style={{
        padding: "10px 12px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: "8px",
        alignItems: "flex-end",
        backgroundColor: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
        disabled={sending}
        rows={1}
        style={{
          flex: 1,
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "8px 10px",
          color: "var(--text-primary)",
          fontSize: "13px",
          fontFamily: "var(--font-body)",
          resize: "none",
          outline: "none",
          lineHeight: 1.4,
          minHeight: "36px",
          maxHeight: "120px",
          overflowY: "auto",
        }}
        onFocus={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)";
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || sending}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: value.trim() && !sending ? "var(--accent)" : "var(--surface-elevated)",
          color: value.trim() && !sending ? "var(--bg)" : "var(--text-muted)",
          cursor: value.trim() && !sending ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          flexShrink: 0,
        }}
      >
        {sending ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
      </button>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
