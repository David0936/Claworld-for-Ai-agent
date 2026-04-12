"use client";

import { useEffect, useState } from "react";
import { Brain, Clock, FileText } from "lucide-react";

interface MemoryFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  preview: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [content, setContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function openFile(file: MemoryFile) {
    setSelectedFile(file);
    setLoadingContent(true);
    fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`)
      .then((r) => r.text())
      .then((text) => {
        setContent(text);
        setLoadingContent(false);
      })
      .catch(() => setLoadingContent(false));
  }

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
          Memory
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {files.length} memory files · long-term agent knowledge
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: "16px", flex: 1, minHeight: 0 }}>
        {/* File list */}
        <div style={{ width: selectedFile ? "45%" : "100%", transition: "width 0.2s", overflow: "auto" }}>
          {files.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No memory files found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => openFile(file)}
                  className="card"
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    border: selectedFile?.path === file.path ? "1px solid var(--accent)" : "1px solid transparent",
                    background: selectedFile?.path === file.path ? "var(--accent-soft)" : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Brain size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
                      {file.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", flexShrink: 0 }}>
                      <Clock size={10} />
                      <span style={{ fontSize: "10px" }}>{formatDate(file.modified)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {file.preview}
                  </p>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File preview */}
        {selectedFile && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface-elevated)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={13} style={{ color: "var(--info)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                {selectedFile.name}
              </span>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {loadingContent ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
              ) : (
                <pre style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                  {content}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
