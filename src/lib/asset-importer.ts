/**
 * Asset Importer — unzip + validate + store + register
 */

import JSZip from "jszip";
import {
  putAssetFile,
  getAssetUrl,
  deleteAssetFiles,
} from "./asset-storage";
import {
  parseManifest,
  checkCompatibility,
} from "./manifest-parser";
import { registerAsset } from "./asset-registry";
import type { AssetManifest } from "./asset-registry";

export interface ImportResult {
  ok: boolean;
  manifest?: AssetManifest;
  error?: string;
  assetId?: string;
}

const ASSET_KEY_PREFIX = "custom/";

export async function importAssetZip(file: File): Promise<ImportResult> {
  try {
    // 1. Read zip
    const zip = await JSZip.loadAsync(file);

    // 2. Find manifest.json
    const manifestEntry = zip.file("manifest.json");
    if (!manifestEntry) {
      return { ok: false, error: "No manifest.json found in package" };
    }

    const raw = await manifestEntry.async("text");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "manifest.json is not valid JSON" };
    }

    // 3. Validate manifest
    const { manifest, error: parseError } = parseManifest(parsed);
    if (parseError || !manifest) {
      return { ok: false, error: parseError ?? "Invalid manifest" };
    }

    // 4. Check version compatibility
    const compat = checkCompatibility(manifest);
    if (!compat.ok) {
      return { ok: false, error: `Version mismatch: ${compat.reason}` };
    }

    // 5. Delete old files if re-importing
    await deleteAssetFiles(`${ASSET_KEY_PREFIX}${manifest.id}/`);

    // 6. Extract and store each file
    const assetsMap: Record<string, string> = {};
    const promises: Promise<void>[] = [];

    zip.forEach((relativePath, entry) => {
      if (entry.dir) return; // skip directories
      if (relativePath === "manifest.json") return; // already handled

      const storageKey = `${ASSET_KEY_PREFIX}${manifest.id}/${relativePath}`;
      const blobPromise = entry.async("blob").then((blob) =>
        putAssetFile(storageKey, blob)
      );
      promises.push(blobPromise);

      // Store relative path mapping
      const filename = relativePath.split("/").pop() ?? relativePath;
      assetsMap[filename] = storageKey;
    });

    await Promise.all(promises);

    // 7. Register in registry
    const finalManifest: AssetManifest = {
      ...manifest,
      assets: assetsMap,
      installedAt: new Date().toISOString(),
    };

    registerAsset(finalManifest);

    return { ok: true, manifest: finalManifest, assetId: manifest.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Failed to import: ${msg}` };
  }
}

/**
 * Get the URL for a specific asset file (from IndexedDB or static path).
 */
export async function resolveAssetUrl(filename: string): Promise<string | null> {
  // Try static /office-assets/assets/ first (default skin)
  const staticPath = `/office-assets/assets/${filename}`;
  try {
    const r = await fetch(staticPath, { method: "HEAD" });
    if (r.ok) return staticPath;
  } catch {
    // fall through
  }
  return null;
}
