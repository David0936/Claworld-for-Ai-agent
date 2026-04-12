"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Clock } from "lucide-react";

interface FilePreviewProps {
  path: string;
}

function simpleMarkdown(text: string): string {
  const lines = text.split("\n");
  const output: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine;

    // Code blocks
    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        output.push(`<pre style="background:#1e1e2e;padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0"><code style="font-family:ui-monospace,monospace;font-size:12px;color:#cdd6f4;line-height:1.6">${codeLines.join("\n")}</code></pre>`);
        inCode = false;
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      continue;
    }

    // Headers
    if (line.startsWith("# ")) {
      output.push(`<h1 style="font-size:20px;font-weight:700;margin:16px 0 8px;color:var(--text-primary)">${line.substring(2)}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      output.push(`<h2 style="font-size:16px;font-weight:600;margin:14px 0 6px;color:var(--text-primary)">${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      output.push(`<h3 style="font-size:14px;font-weight:600;margin:12px 0 4px;color:var(--text-secondary)">${line.substring(4)}</h3>`);
      continue;
    }

    // Code inline
    let processed = line.replace(/`([^`]+)`/g, '<code style="background:#262636;padding:1px 5px;border-radius:4px;font-family:ui-monospace,monospace;font-size:11px;color:#f38ba8">$1</code>');

    // Bold
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:600;color:var(--text-primary)">$1</strong>');

    // Italic
    processed = processed.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;color:var(--text-secondary)">$1</em>');

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--accent);text-decoration:underline">$1</a>');

    // Lists
    if (line.match(/^[-*] /)) {
      output.push(`<li style="margin:2px 0 2px 16px;color:var(--text-secondary);font-size:13px;line-height:1.6">${processed.replace(/^[-*] /, "• ")}</li>`);
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      output.push(`<li style="margin:2px 0 2px 16px;color:var(--text-secondary);font-size:13px;line-height:1.6;list-style:none"><span style="color:var(--accent);margin-right:6px">${num}.</span>${processed.replace(/^\d+\. /, "")}</li>`);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      output.push('<div style="height:6px"></div>');
      continue;
    }

    output.push(`<p style="margin:3px 0;font-size:13px;line-height:1.6;color:var(--text-secondary)">${processed}</p>`);
  }

  return output.join("\n");
}

function getFileMeta(content: string): { lines: number; words: number; chars: number } {
  const lines = content.split("\n").length;
  const words = content.split(/\s+/).filter(Boolean).length;
  return { lines, words, chars: content.length };
}

export function FilePreview({ path }: FilePreviewProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("preview");

  const filename = path.split("/").pop() || path;
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const isMarkdown = ext === "md";
  const isCode = ["ts", "tsx", "js", "jsx", "css", "html", "json", "yaml", "yml", "toml", "sh", "py"].includes(ext);
  const autoPreview = isMarkdown;

  const meta = content ? getFileMeta(content) : null;

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    setPreviewMode(autoPreview ? "preview" : "code");

    fetch(`/api/files/read?path=${encodeURIComponent(path)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load file");
        return r.text();
      })
      .then((text) => {
        setContent(text.substring(0, 20000));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [path, autoPreview]);

  if (!path) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>
        Select a file to preview
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "20px", fontSize: "13px", color: "var(--text-muted)" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", fontSize: "13px", color: "var(--negative)" }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* File header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-elevated)", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <FileText size={13} style={{ color: "var(--info)", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {filename}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {meta && (
            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {meta.lines}L · {meta.words}w
            </span>
          )}
          {isMarkdown && (
            <div style={{ display: "flex", background: "var(--surface)", borderRadius: "var(--radius-sm)", padding: "2px", gap: "2px" }}>
              <button onClick={() => setPreviewMode("code")} style={{ padding: "2px 8px", fontSize: "10px", border: "none", borderRadius: "4px", cursor: "pointer", background: previewMode === "code" ? "var(--accent-soft)" : "transparent", color: previewMode === "code" ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Code</button>
              <button onClick={() => setPreviewMode("preview")} style={{ padding: "2px 8px", fontSize: "10px", border: "none", borderRadius: "4px", cursor: "pointer", background: previewMode === "preview" ? "var(--accent-soft)" : "transparent", color: previewMode === "preview" ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Preview</button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px" }}>
        {previewMode === "preview" && isMarkdown ? (
          <div
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }}
            style={{ fontSize: "13px", lineHeight: 1.7 }}
          />
        ) : (
          <pre style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
