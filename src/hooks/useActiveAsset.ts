"use client";
import { useState, useEffect } from "react";
import { getActiveAsset, getActiveManifest } from "@/lib/asset-registry";
import type { AssetRecord, AssetManifest } from "@/lib/asset-registry";

export function useActiveAsset() {
  const [active, setActive] = useState<AssetRecord | undefined>(undefined);
  const [manifest, setManifest] = useState<AssetManifest>(getActiveManifest());

  useEffect(() => {
    function load() {
      setActive(getActiveAsset());
      setManifest(getActiveManifest());
    }
    load();
    // Listen to storage events (from other tabs)
    window.addEventListener("storage", load);
    // Custom event for same-tab updates
    window.addEventListener("claworld:asset-changed", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("claworld:asset-changed", load);
    };
  }, []);

  function dispatchChange() {
    window.dispatchEvent(new Event("claworld:asset-changed"));
  }

  return { active, manifest, dispatchChange };
}
