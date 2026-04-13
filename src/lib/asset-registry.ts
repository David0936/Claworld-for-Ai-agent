/**
 * Asset Registry — localStorage-backed asset management
 * Simulates the local file system: assets/official/{assetId}/
 */

export interface AssetManifest {
  id: string;
  name: string;
  nameZh: string;
  version: string;
  containerVersion: string;
  type: "skin" | "space" | "character" | "pet" | "theme" | "bundle";
  author: string;
  authorContact?: string;
  description: string;
  preview: string;
  tags: string[];
  license: string;
  replaceLayers: string[];
  assets: Record<string, string>; // filename → relative path
  installedAt: string | null;
  sizeBytes: number;
}

export interface AssetRecord {
  manifest: AssetManifest;
  status: "available" | "installed" | "loaded" | "error";
  installedAt: string;
  loadError?: string;
}

export type RegistryData = {
  assets: Record<string, AssetRecord>;
  activeAssetId: string | null;
};

const REGISTRY_KEY = "claworld_asset_registry";
const DEFAULT_SKIN_MANIFEST: AssetManifest = {
  id: "default",
  name: "Default Office",
  nameZh: "默认办公室",
  version: "0.1.0",
  containerVersion: ">=0.1.0",
  type: "skin",
  author: "Claworld Team",
  authorContact: "support@claworld.cc",
  description: "经典 Claworld 像素办公室。简洁、专业、稳定的默认工作空间。",
  preview: "/office-assets/default-skin/preview.png",
  tags: ["default", "office", "minimal"],
  license: "personal",
  replaceLayers: [],
  assets: {
    "room-bg.png": "./assets/room-bg.png",
    "char-lobster.png": "./assets/char-lobster.png",
    "layer-coords.json": "./assets/layer-coords.json",
  },
  installedAt: null,
  sizeBytes: 0,
};

function emptyRegistry(): RegistryData {
  return { assets: {}, activeAssetId: null };
}

function loadRegistry(): RegistryData {
  if (typeof window === "undefined") return emptyRegistry();
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) {
      // First launch: seed with default skin
      const reg = emptyRegistry();
      reg.assets["default"] = {
        manifest: { ...DEFAULT_SKIN_MANIFEST, installedAt: new Date().toISOString() },
        status: "installed",
        installedAt: new Date().toISOString(),
      };
      reg.activeAssetId = "default";
      saveRegistry(reg);
      return reg;
    }
    return JSON.parse(raw) as RegistryData;
  } catch {
    return emptyRegistry();
  }
}

function saveRegistry(reg: RegistryData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
  } catch (e) {
    console.error("[AssetRegistry] Failed to save:", e);
  }
}

// ── Public API ──────────────────────────────────────────────

export function getRegistry(): RegistryData {
  return loadRegistry();
}

export function getAllAssets(): AssetRecord[] {
  return Object.values(loadRegistry().assets);
}

export function getAsset(id: string): AssetRecord | undefined {
  return loadRegistry().assets[id];
}

export function getActiveAsset(): AssetRecord | undefined {
  const reg = loadRegistry();
  if (!reg.activeAssetId) return undefined;
  return reg.assets[reg.activeAssetId];
}

export function getActiveManifest(): AssetManifest {
  return getActiveAsset()?.manifest ?? DEFAULT_SKIN_MANIFEST;
}

export function registerAsset(manifest: AssetManifest): AssetRecord {
  const reg = loadRegistry();
  const now = new Date().toISOString();
  const record: AssetRecord = {
    manifest: { ...manifest, installedAt: now },
    status: "installed",
    installedAt: now,
  };
  reg.assets[manifest.id] = record;
  if (!reg.activeAssetId) {
    reg.activeAssetId = manifest.id;
    record.status = "loaded";
  }
  saveRegistry(reg);
  return record;
}

export function unregisterAsset(id: string): void {
  const reg = loadRegistry();
  if (id === "default") return; // protect default
  delete reg.assets[id];
  if (reg.activeAssetId === id) {
    reg.activeAssetId = "default";
    if (reg.assets["default"]) reg.assets["default"].status = "loaded";
  }
  saveRegistry(reg);
}

export function setActiveAsset(id: string): AssetRecord {
  const reg = loadRegistry();
  // Deactivate previous
  if (reg.activeAssetId && reg.assets[reg.activeAssetId]) {
    reg.assets[reg.activeAssetId].status = "installed";
  }
  // Activate new
  reg.activeAssetId = id;
  if (reg.assets[id]) {
    reg.assets[id].status = "loaded";
  }
  saveRegistry(reg);
  return reg.assets[id];
}

export function setAssetError(id: string, error: string): void {
  const reg = loadRegistry();
  if (reg.assets[id]) {
    reg.assets[id].status = "error";
    reg.assets[id].loadError = error;
    saveRegistry(reg);
  }
}

export function resetRegistry(): RegistryData {
  const reg = emptyRegistry();
  // Always keep default
  const now = new Date().toISOString();
  reg.assets["default"] = {
    manifest: { ...DEFAULT_SKIN_MANIFEST, installedAt: now },
    status: "loaded",
    installedAt: now,
  };
  reg.activeAssetId = "default";
  saveRegistry(reg);
  return reg;
}
