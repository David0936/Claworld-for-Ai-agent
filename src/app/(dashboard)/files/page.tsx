"use client";

import { useEffect, useState } from "react";
import { FileTree } from "@/components/FileTree";
import { FilePreview } from "@/components/FilePreview";
import { FolderOpen, RefreshCw } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileNode[];
}

export default function FilesPage() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        setTree(data.tree || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            File Browser
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Workspace file explorer
          </p>
        </div>
        <button
          className="btn-outline"
          onClick={() => {
            setLoading(true);
            fetch("/api/files")
              .then((r) => r.json())
              .then((data) => {
                setTree(data.tree || []);
                setLoading(false);
              })
              .catch(() => setLoading(false));
          }}
          style={{ padding: "8px 14px", fontSize: "12px" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* File browser layout */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "16px",
          minHeight: 0,
        }}
      >
        {/* Tree panel */}
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            overflow: "auto",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            padding: "8px",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              Loading...
            </div>
          ) : tree.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-muted)",
              }}
            >
              <FolderOpen
                size={32}
                style={{ margin: "0 auto 12px", opacity: 0.3 }}
              />
              <p style={{ fontSize: "13px" }}>Empty workspace</p>
            </div>
          ) : (
            <FileTree
              nodes={tree}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          )}
        </div>

        {/* Preview panel */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            overflow: "hidden",
          }}
        >
          <FilePreview path={selectedPath || ""} />
        </div>
      </div>
    </div>
  );
}
