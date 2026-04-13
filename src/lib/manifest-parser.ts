/**
 * Manifest Parser
 * Reads and validates a manifest.json from an asset package (zip or local)
 */

import type { AssetManifest } from "./asset-registry";

export interface ParseResult {
  manifest: AssetManifest | null;
  error: string | null;
}

const REQUIRED_FIELDS: (keyof AssetManifest)[] = [
  "id",
  "name",
  "version",
  "type",
];

const VALID_TYPES = ["skin", "space", "character", "pet", "theme", "bundle"];

export function parseManifest(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") {
    return { manifest: null, error: "Invalid JSON: not an object" };
  }

  const obj = raw as Record<string, unknown>;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      return { manifest: null, error: `Missing required field: ${field}` };
    }
  }

  // Type validation
  if (!VALID_TYPES.includes(obj.type as string)) {
    return {
      manifest: null,
      error: `Invalid type "${obj.type}". Must be one of: ${VALID_TYPES.join(", ")}`,
    };
  }

  // Version must be non-empty string
  if (typeof obj.version !== "string" || obj.version.trim() === "") {
    return { manifest: null, error: "version must be a non-empty string" };
  }

  // assets must be an object (can be empty)
  if (obj.assets !== undefined && (typeof obj.assets !== "object" || obj.assets === null)) {
    return { manifest: null, error: "assets must be an object" };
  }

  const manifest: AssetManifest = {
    id: String(obj.id).trim(),
    name: String(obj.name).trim(),
    nameZh: String(obj.nameZh ?? obj.name).trim(),
    version: String(obj.version).trim(),
    containerVersion: String(obj.containerVersion ?? ">=0.1.0").trim(),
    type: obj.type as AssetManifest["type"],
    author: String(obj.author ?? "Unknown").trim(),
    authorContact: obj.authorContact ? String(obj.authorContact) : undefined,
    description: String(obj.description ?? "").trim(),
    preview: String(obj.preview ?? "").trim(),
    tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
    license: String(obj.license ?? "personal").trim(),
    replaceLayers: Array.isArray(obj.replaceLayers)
      ? obj.replaceLayers.map(String)
      : [],
    assets: (obj.assets as Record<string, string>) ?? {},
    installedAt: null,
    sizeBytes: typeof obj.sizeBytes === "number" ? obj.sizeBytes : 0,
  };

  return { manifest, error: null };
}

/**
 * Check if a loaded manifest is compatible with the current container version.
 */
export function checkCompatibility(
  manifest: AssetManifest,
  containerVersion: string = "0.1.0"
): { ok: boolean; reason?: string } {
  const req = manifest.containerVersion;
  if (!req) return { ok: true };

  // Simple semver-ish check: >=x.y.z
  const reqVersion = req.replace(">=", "").trim();
  const [reqMajor, reqMinor, reqPatch] = reqVersion.split(".").map(Number);
  const [curMajor, curMinor, curPatch] = containerVersion.split(".").map(Number);

  if (curMajor < reqMajor) return { ok: false, reason: `Requires container ${req}` };
  if (curMajor === reqMajor && curMinor < reqMinor) return { ok: false, reason: `Requires container ${req}` };
  if (curMajor === reqMajor && curMinor === reqMinor && curPatch < reqPatch) {
    return { ok: false, reason: `Requires container ${req}` };
  }
  return { ok: true };
}
