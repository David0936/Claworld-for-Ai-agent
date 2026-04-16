"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { SessionList } from "./SessionList";
import { MessageThread } from "./MessageThread";
import { ChatInput } from "./ChatInput";
import type { ChatSession } from "@/hooks/useChatSessions";
import type { ChatMessage } from "@/hooks/useChatHistory";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const handleSelectSession = useCallback((session: ChatSession) => {
    setSelectedSession(session);
    setMessages([]);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  }, []);

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: selectedSession?.sessionKey || null,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      // Optimistically add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(false);
    }
  }, [selectedSession, sending]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 99,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "360px",
          height: "100vh",
          backgroundColor: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
          animation: "slideInRight 0.2s ease-out",
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
            AI 对话
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Session List */}
          <div
            style={{
              width: "120px",
              borderRight: "1px solid var(--border)",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <SessionList
              selectedKey={selectedSession?.sessionKey || null}
              onSelect={handleSelectSession}
            />
          </div>

          {/* Message Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {selectedSession ? (
              <>
                <MessageThread
                  sessionKey={selectedSession.sessionKey}
                  initialMessages={messages}
                  onMessagesUpdate={handleMessagesUpdate}
                />
                <ChatInput onSend={handleSend} sending={sending} />
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "16px",
                }}
              >
                选择一个会话开始对话
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
