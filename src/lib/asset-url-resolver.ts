/**
 * Asset URL Resolver — resolves layer filenames to actual URLs
 * For default skin: static /office-assets/assets/ paths
 * For custom skins: IndexedDB blob URLs
 */

import { getAssetFile } from "./asset-storage";

const ASSET_KEY_PREFIX = "custom/";

/** Get URL for a layer file. Returns null if not found. */
export async function resolveLayerUrl(
  assetId: string,
  filename: string
): Promise<string | null> {
  // Custom asset: check IndexedDB
  if (assetId !== "default") {
    const key = `${ASSET_KEY_PREFIX}${assetId}/${filename}`;
    const blob = await getAssetFile(key);
    if (blob) return URL.createObjectURL(blob);
  }

  // Default: static path
  return `/office-assets/assets/${filename}`;
}

/** Preload all layer files for a given asset, returns map of key → URL */
export async function preloadAssetLayers(
  assetId: string,
  layerFiles: string[]
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const blobs: Array<{ key: string; blob: Blob }> = [];

  for (const filename of layerFiles) {
    if (assetId === "default") {
      urls[filename] = `/office-assets/assets/${filename}`;
    } else {
      const key = `${ASSET_KEY_PREFIX}${assetId}/${filename}`;
      const blob = await getAssetFile(key);
      if (blob) {
        const url = URL.createObjectURL(blob);
        urls[filename] = url;
        blobs.push({ key, blob });
      }
    }
  }

  return urls;
}
