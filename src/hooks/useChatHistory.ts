"use client";

import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  model?: string;
}

// Extract text from gateway message content
function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "object" && block !== null) {
          const b = block as Record<string, unknown>;
          // Skip thinking blocks
          if (b.type === "thinking") return "";
          if (b.type === "text" && typeof b.text === "string") return b.text;
          if (typeof b.text === "string") return b.text;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof content === "object" && content !== null) {
    const c = content as Record<string, unknown>;
    if (typeof c.text === "string") return c.text;
  }
  return "";
}

export function useChatHistory(sessionKey: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sessionKey) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/chat/history?sessionKey=${encodeURIComponent(sessionKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const normalized: ChatMessage[] = (data.messages || []).map(
        (m: { role?: string; content?: unknown; timestamp?: number | string | null }) => ({
          role: (m.role as "user" | "assistant" | "system") || "assistant",
          content: extractText(m.content),
          timestamp: m.timestamp
            ? new Date(typeof m.timestamp === "number" ? m.timestamp : String(m.timestamp)).toISOString()
            : undefined,
        })
      );
      setMessages(normalized);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { messages, loading, error, refresh: fetchHistory };
}
