"use client";

import { useEffect, useRef } from "react";
import { useChatHistory, type ChatMessage } from "@/hooks/useChatHistory";
import { Bot, User } from "lucide-react";

interface MessageThreadProps {
  sessionKey: string;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function parseSimpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code style=\"background:var(--surface-elevated);padding:1px 4px;border-radius:3px;font-size:0.9em;\">$1</code>")
    .replace(/\n/g, "<br/>");
}

export function MessageThread({ sessionKey, initialMessages, onMessagesUpdate }: MessageThreadProps) {
  const { messages, loading, error, refresh } = useChatHistory(sessionKey);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Merge initialMessages (optimistic) with fetched history
  const allMessages: ChatMessage[] = initialMessages && initialMessages.length > 0
    ? [...messages, ...initialMessages.filter(im =>
        !messages.some(m => m.timestamp === im.timestamp && m.content === im.content)
      )]
    : messages;

  useEffect(() => {
    onMessagesUpdate?.(allMessages);
  }, [allMessages, onMessagesUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading && !allMessages.length) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
        加载历史消息…
      </div>
    );
  }

  if (error && !allMessages.length) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--negative)", fontSize: "12px" }}>
        无法加载消息
      </div>
    );
  }

  if (!allMessages.length) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>
        开始对话吧 👋
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {allMessages.map((msg, idx) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id || idx}
            style={{
              display: "flex",
              flexDirection: isUser ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: "6px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: isUser ? "var(--accent)" : "var(--surface-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              {isUser ? (
                <User size={12} style={{ color: "var(--bg)" }} />
              ) : (
                <Bot size={12} style={{ color: "var(--accent)" }} />
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: "75%",
                background: isUser ? "var(--accent-soft)" : "var(--surface-elevated)",
                borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                padding: "8px 10px",
                border: isUser ? "none" : "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "var(--text-primary)",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(msg.content) }}
              />
              {msg.timestamp && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                    textAlign: isUser ? "right" : "left",
                  }}
                >
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
