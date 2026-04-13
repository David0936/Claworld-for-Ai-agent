"use client";
import { useState, useEffect, useCallback } from "react";
import type { AssetRecord } from "@/lib/asset-registry";
import {
  getRegistry,
  getAllAssets,
  getActiveAsset,
  registerAsset,
  unregisterAsset,
  setActiveAsset,
  setAssetError,
} from "@/lib/asset-registry";

const REGISTRY_VERSION = "1"; // bump to force reload

export function useAssetRegistry() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setAssets(getAllAssets());
    setActiveId(getRegistry().activeAssetId);
  }

  useEffect(() => {
    refresh();
    setLoading(false);
  }, []);

  const activate = useCallback((id: string) => {
    setActiveAsset(id);
    refresh();
  }, []);

  const remove = useCallback((id: string) => {
    unregisterAsset(id);
    refresh();
  }, []);

  const setError = useCallback((id: string, error: string) => {
    setAssetError(id, error);
    refresh();
  }, []);

  return {
    assets,
    activeId,
    loading,
    activate,
    remove,
    setError,
    refresh,
  };
}
