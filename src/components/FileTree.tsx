"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}

export function FileTree({ nodes, selectedPath, onSelect, depth = 0 }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div>
      {nodes.map((node) => {
        const isSelected = selectedPath === node.path;
        const isExpanded = expanded[node.path];
        const isDir = node.type === "directory";

        return (
          <div key={node.path}>
            <div
              onClick={() => {
                if (isDir) toggleExpand(node.path);
                onSelect(node.path);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: `6px 8px`,
                paddingLeft: `${depth * 16 + 8}px`,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "12px",
                color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                backgroundColor: isSelected ? "var(--accent-soft)" : "transparent",
                fontWeight: isSelected ? 600 : 400,
                transition: "all 0.1s ease",
                fontFamily: "var(--font-mono)",
              }}
            >
              {isDir ? (
                <>
                  {isExpanded ? (
                    <ChevronDown size={12} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronRight size={12} style={{ flexShrink: 0 }} />
                  )}
                  {isExpanded ? (
                    <FolderOpen
                      size={14}
                      style={{ flexShrink: 0, color: "var(--warning)" }}
                    />
                  ) : (
                    <Folder
                      size={14}
                      style={{ flexShrink: 0, color: "var(--warning)" }}
                    />
                  )}
                </>
              ) : (
                <>
                  <span style={{ width: "12px", flexShrink: 0 }} />
                  <FileText size={14} style={{ flexShrink: 0, color: "var(--info)" }} />
                </>
              )}
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {node.name}
              </span>
            </div>

            {isDir && isExpanded && node.children && (
              <FileTree
                nodes={node.children}
                selectedPath={selectedPath}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
