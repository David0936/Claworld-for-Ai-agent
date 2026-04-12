"use client";

import { useEffect, useState, useRef, useCallback, KeyboardEvent } from "react";
import { Terminal, ChevronRight, AlertCircle } from "lucide-react";

interface OutputLine {
  id: number;
  type: "command" | "output" | "error" | "info";
  text: string;
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

export default function TerminalPage() {
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [cwd, setCwd] = useState("~/.openclaw/workspace");
  const [allowedCommands, setAllowedCommands] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let lineId = useRef(0);

  useEffect(() => {
    // Load allowed commands
    fetch("/api/terminal")
      .then((r) => r.json())
      .then((d) => {
        setAllowedCommands(d.allowedCommands || []);
        setCwd(d.workspace || "~/.openclaw/workspace");
        addLine("info", `Claworld Terminal · Workspace: ${d.workspace}`);
        addLine("info", `Type commands to interact with OpenClaw. Press Enter to run.`);
        addLine("info", `Allowed: ${d.allowedCommands.join(", ")}`);
        addLine("info", "");
      })
      .catch(() => {
        addLine("error", "Failed to connect to terminal API");
      });
  }, []);

  function addLine(type: OutputLine["type"], text: string) {
    lineId.current++;
    setLines((prev) => [...prev, { id: lineId.current, type, text }]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const runCommand = useCallback(async () => {
    const cmd = input.trim();
    if (!cmd || running) return;
    if (cmd === "clear" || cmd === "cls") {
      setLines([]);
      setInput("");
      return;
    }

    addLine("command", `❯ ${cmd}`);
    setInput("");
    setRunning(true);
    setHistory((h) => [cmd, ...h].slice(0, 50));
    setHistoryIdx(-1);

    try {
      const r = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await r.json();

      if (data.error) {
        addLine("error", `Error: ${data.error}`);
      } else if (data.output) {
        const lines = stripAnsi(data.output).split("\n");
        for (const l of lines) {
          if (l) addLine("output", l);
        }
        if (data.duration) {
          addLine("info", `Done in ${data.duration}ms`);
        }
      }
    } catch (e) {
      addLine("error", `Request failed: ${String(e)}`);
    }

    setRunning(false);
    inputRef.current?.focus();
  }, [input, running]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(nextIdx);
      setInput(nextIdx === -1 ? "" : history[nextIdx] || "");
    }
  }

  const quickCommands = [
    { cmd: "ls", label: "ls" },
    { cmd: "git status", label: "git" },
    { cmd: "whoami", label: "who" },
    { cmd: "date", label: "date" },
    { cmd: "ps aux | head -5", label: "ps" },
    { cmd: "df -h", label: "disk" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          Terminal
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Run commands in the OpenClaw workspace
        </p>
      </div>

      {/* Quick commands */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
        {quickCommands.map((q) => (
          <button
            key={q.cmd}
            onClick={() => {
              setInput(q.cmd);
              inputRef.current?.focus();
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-muted)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Terminal output */}
      <div
        style={{
          flex: 1,
          background: "#0d0d0d",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "auto",
          padding: "16px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          lineHeight: 1.6,
          marginBottom: "12px",
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              color:
                line.type === "command"
                  ? "#f5c2e7"
                  : line.type === "error"
                  ? "#f38ba8"
                  : line.type === "info"
                  ? "#89b4fa"
                  : "#cdd6f4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              minHeight: "18px",
            }}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#1a1a2e",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--accent)",
          padding: "10px 14px",
        }}
      >
        <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "13px", flexShrink: 0 }}>
          ❯
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a command and press Enter..."
          disabled={running}
          autoFocus
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f5c2e7",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        />
        {running && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>running...</span>
        )}
        <button
          onClick={runCommand}
          disabled={running || !input.trim()}
          style={{
            padding: "4px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--accent)",
            background: input.trim() && !running ? "var(--accent-soft)" : "transparent",
            color: input.trim() && !running ? "var(--accent)" : "var(--text-muted)",
            fontSize: "11px",
            fontWeight: 600,
            cursor: input.trim() && !running ? "pointer" : "not-allowed",
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
}
