"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Activity, Puzzle, X } from "lucide-react";

interface SearchResult {
  type: string;
  title: string;
  description: string;
  path?: string;
  url?: string;
  score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback((q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results || []);
        setLoading(false);
        setSearched(true);
      })
      .catch(() => {
        setLoading(false);
        setSearched(true);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const typeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText size={14} style={{ color: "var(--info)" }} />;
      case "activity": return <Activity size={14} style={{ color: "var(--positive)" }} />;
      case "skill": return <Puzzle size={14} style={{ color: "var(--accent)" }} />;
      default: return <FileText size={14} style={{ color: "var(--text-muted)" }} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "6px" }}>
          Search
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Search across files, activities, and skills
        </p>
      </div>

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search... (min 2 characters)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "12px 40px 12px 42px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            background: "var(--surface-elevated)",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              border: "none", background: "transparent", cursor: "pointer",
              color: "var(--text-muted)", padding: "4px",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
          Searching...
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && query.length >= 2 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "14px", marginBottom: "4px" }}>No results found</p>
          <p style={{ fontSize: "12px" }}>Try different keywords</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !query && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <Search size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <p style={{ fontSize: "14px" }}>Type to search across your workspace</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((result, i) => (
            <div key={i} className="card" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>{typeIcon(result.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {result.title}
                    </span>
                    <span style={{
                      fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                      background: "var(--surface)", color: "var(--text-muted)",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>
                      {result.type}
                    </span>
                    {result.path && (
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {result.path}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0,
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {result.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
