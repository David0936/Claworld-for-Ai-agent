"use client";
import { useState, useRef, useCallback } from "react";
import { useAssetRegistry } from "@/hooks/useAssetRegistry";
import { importAssetZip } from "@/lib/asset-importer";
import type { AssetRecord } from "@/lib/asset-registry";

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  skin: "Skins",
  space: "Spaces",
  character: "Characters",
  pet: "Pets",
  theme: "Themes",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  installed: "Installed",
  loaded: "Active",
  error: "Error",
};

const STATUS_COLORS: Record<string, string> = {
  available: "#6a6a6a",
  installed: "#3498DB",
  loaded: "#FF385C",
  error: "#E74C3C",
};

function AssetCard({
  record,
  onActivate,
  onRemove,
}: {
  record: AssetRecord;
  onActivate: () => void;
  onRemove: () => void;
}) {
  const m = record.manifest;
  const isLoaded = record.status === "loaded";
  const isDefault = m.id === "default";

  return (
    <div className="lib-card">
      <div className="lib-card-preview">
        <div
          className="lib-card-preview-inner"
          style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}
        >
          <span className="lib-card-type">{m.type}</span>
          {isLoaded && <span className="lib-card-loaded-badge">Active</span>}
          {record.status === "error" && (
            <span className="lib-card-error-badge">⚠ Error</span>
          )}
        </div>
      </div>
      <div className="lib-card-body">
        <div className="lib-card-title">{m.name}</div>
        {m.nameZh !== m.name && (
          <div className="lib-card-sub">{m.nameZh}</div>
        )}
        <div className="lib-card-meta">
          <span className="lib-card-version">v{m.version}</span>
          <span
            className="lib-card-status"
            style={{ color: STATUS_COLORS[record.status] }}
          >
            ● {STATUS_LABELS[record.status]}
          </span>
        </div>
        {record.loadError && (
          <div className="lib-card-error">{record.loadError}</div>
        )}
        <div className="lib-card-actions">
          {!isLoaded && (
            <button className="lib-btn-load" onClick={onActivate}>
              Load
            </button>
          )}
          {isLoaded && (
            <button className="lib-btn-loaded" disabled>
              ✓ Active
            </button>
          )}
          {!isDefault && (
            <button className="lib-btn-remove" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { assets, activeId, activate, remove, refresh, loading } = useAssetRegistry();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    if (filterType !== "all" && a.manifest.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const counts = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.manifest.type] = (acc[a.manifest.type] ?? 0) + 1;
    return acc;
  }, {});

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".zip")) {
        setImportError("Please select a .zip asset package.");
        return;
      }

      setImporting(true);
      setImportError(null);
      setImportSuccess(null);

      const result = await importAssetZip(file);

      setImporting(false);
      if (result.ok) {
        setImportSuccess(`"${result.manifest?.name}" imported successfully!`);
        refresh();
        // Auto-activate the newly imported asset
        if (result.assetId) {
          activate(result.assetId);
        }
      } else {
        setImportError(result.error ?? "Import failed.");
      }

      // Reset file input
      if (fileRef.current) fileRef.current.value = "";
    },
    [refresh, activate]
  );

  return (
    <div className="library-page">
      {/* Header */}
      <div className="library-header">
        <div>
          <h1 className="library-title">Library</h1>
          <p className="library-subtitle">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
            {assets.find((a) => a.status === "loaded")
              ? `Active: ${assets.find((a) => a.status === "loaded")?.manifest.name}`
              : "no active skin"}
          </p>
        </div>
        <div className="library-header-actions">
          <input
            ref={fileRef}
            type="file"
            accept=".zip"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            className="lib-btn-import"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? "⏳ Importing..." : "+ Import Asset Package"}
          </button>
        </div>
      </div>

      {/* Import feedback */}
      {importError && (
        <div className="lib-alert lib-alert-error">
          ⚠️ {importError}
          <button onClick={() => setImportError(null)} style={{ marginLeft: 12, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>×</button>
        </div>
      )}
      {importSuccess && (
        <div className="lib-alert lib-alert-success">
          ✅ {importSuccess}
          <button onClick={() => setImportSuccess(null)} style={{ marginLeft: 12, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>×</button>
        </div>
      )}

      <div className="library-layout">
        {/* Sidebar */}
        <aside className="library-sidebar">
          <div className="lib-sidebar-section">
            <div className="lib-sidebar-label">Type</div>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`lib-sidebar-btn${filterType === key ? " active" : ""}`}
                onClick={() => setFilterType(key)}
              >
                {label}
                <span className="lib-sidebar-count">
                  {key === "all" ? assets.length : counts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="lib-sidebar-section">
            <div className="lib-sidebar-label">Status</div>
            {["all", "loaded", "installed", "error"].map((key) => (
              <button
                key={key}
                className={`lib-sidebar-btn${filterStatus === key ? " active" : ""}`}
                onClick={() => setFilterStatus(key)}
              >
                {key === "all" ? (
                  "All"
                ) : (
                  <>
                    <span style={{ color: STATUS_COLORS[key] }}>●</span> {STATUS_LABELS[key]}
                  </>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Grid */}
        <div className="library-main">
          {loading ? (
            <div className="library-loading">
              <div className="lib-spinner" />
              <span>Loading library...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="library-empty">
              <div className="library-empty-icon">📦</div>
              <h3>No assets found</h3>
              <p>
                {filterType !== "all" || filterStatus !== "all"
                  ? "Try a different filter."
                  : "Import an asset package (.zip) to get started."}
              </p>
              {(filterType !== "all" || filterStatus !== "all") && (
                <button
                  className="lib-btn-import"
                  style={{ marginTop: 16 }}
                  onClick={() => { setFilterType("all"); setFilterStatus("all"); }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="library-grid">
              {filtered.map((record) => (
                <AssetCard
                  key={record.manifest.id}
                  record={record}
                  onActivate={() => activate(record.manifest.id)}
                  onRemove={() => {
                    if (
                      confirm(
                        `Remove "${record.manifest.name}"? This cannot be undone.`
                      )
                    ) {
                      remove(record.manifest.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
