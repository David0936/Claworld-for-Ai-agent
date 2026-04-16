"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ChatSession {
  sessionKey: string;
  agentId?: string;
  model?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: string;
  channel?: string;
  displayName?: string;
}

export function useChatSessions(pollInterval = 10_000) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Normalize session data from gateway
      const normalized: ChatSession[] = (data.sessions || []).map(
        (s: Record<string, unknown>) => ({
          sessionKey: (s.key as string) || "",
          channel: s.channel as string | undefined,
          model: s.model as string | undefined,
          updatedAt: s.updatedAt
            ? new Date(s.updatedAt as number).toISOString()
            : undefined,
          displayName: s.displayName as string | undefined,
        })
      );

      setSessions(normalized);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    timerRef.current = setInterval(fetchSessions, pollInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchSessions, pollInterval]);

  return { sessions, loading, error, refresh: fetchSessions };
}
