/**
 * Office Asset Loader
 * Loads pixel art sprites from /public/office-assets/
 *
 * Expected folder structure:
 * /public/office-assets/
 *   ├── assets/
 *   │   ├── room-bg.png           # Background image
 *   │   ├── full-composite.png     # Full pre-composited scene
 *   │   ├── char-lobster.png       # Agent character sprite
 *   │   ├── layer-*.png           # Individual layer PNGs (per-layer)
 *   │   └── layer-coords.json      # Layer positioning data
 *   ├── branding/
 *   │   ├── logo-light.png
 *   │   └── logo-dark.png
 *   └── skins/                     # Future skin packs
 */

export interface OfficeAsset {
  name: string;
  path: string;
  type: "image" | "sprite";
  size?: { w: number; h: number };
}

export interface SkinPack {
  id: string;
  name: string;
  nameZh: string;
  author?: string;
  preview?: string;
  previewGradient?: string;
  assets: Record<string, string>;
}

export interface AssetManifest {
  version: string;
  defaultSkin: string;
  availableSkins: SkinPack[];
  layers: string[];
}

// Layer order (z-index from back to front)
export const LAYER_KEYS = [
  "room-bg",
  "墙左", "墙右", "办公区", "电脑椅子", "沙发地毯",
  "电视", "左边柜子", "机柜", "卫生间", "床",
  "跑步机", "微波炉", "饮水机", "取暖器", "灯",
  "显示状态的机器", "吉他", "小家标识", "LOGO文字",
] as const;

export type LayerKey = typeof LAYER_KEYS[number];

// Manifest
export const ASSET_MANIFEST: AssetManifest = {
  version: "0.1.0",
  defaultSkin: "default",
  availableSkins: [
    {
      id: "default",
      name: "Default Office",
      nameZh: "默认办公室",
      author: "Claworld Team",
      previewGradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
      assets: {},
    },
  ],
  layers: [...LAYER_KEYS],
};

export function getSkinPack(skinId: string): SkinPack {
  return (
    ASSET_MANIFEST.availableSkins.find((s) => s.id === skinId) ||
    ASSET_MANIFEST.availableSkins[0]
  );
}

export function getAssetUrl(assetPath: string): string {
  return `/office-assets/${assetPath}`;
}

export function getOfficeAssetUrl(filename: string): string {
  return `/office-assets/assets/${filename}`;
}

// Preload images for performance
export function preloadImages(paths: string[]): Promise<void[]> {
  return Promise.all(
    paths.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't fail the whole batch
          img.src = src.startsWith("http") ? src : getAssetUrl(src);
        })
    )
  );
}
