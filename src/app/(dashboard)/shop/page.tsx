"use client";

import { useState } from "react";
import { ExternalLink, Download, ShoppingBag, Check, Star, Zap } from "lucide-react";

interface Skin {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  author: string;
  preview: string; // placeholder color or URL
  price: string; // "Free" or "$X.XX"
  badge?: string;
  installed?: boolean;
  active?: boolean;
}

const SKINS: Skin[] = [
  {
    id: "default",
    name: "Default Office",
    nameZh: "默认办公室",
    description: "The classic Claworld pixel office. Clean, minimal, professional.",
    descriptionZh: "经典 Claworld 像素办公室。简洁、极简、专业。",
    author: "Claworld Team",
    preview: "linear-gradient(135deg, #1a1a2e, #16213e)",
    price: "Free",
    installed: true,
    active: true,
    badge: "Active",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Lab",
    nameZh: "赛博朋克实验室",
    description: "Neon lights, dark corridors, futuristic tech vibes. A cyberpunk-inspired office.",
    descriptionZh: "霓虹灯、深色走廊、未来科技感。赛博朋克风格办公室。",
    author: "Claworld Team",
    preview: "linear-gradient(135deg, #0d0221, #ff2a6d)",
    price: "Free",
    badge: "Coming Soon",
  },
  {
    id: "cozy-cafe",
    name: "Cozy Café",
    nameZh: "温馨咖啡馆",
    description: "Warm wood tones, coffee aroma, soft lighting. A cozy café atmosphere.",
    descriptionZh: "温暖木调、咖啡香气、柔和灯光。温馨咖啡馆氛围。",
    author: "Community",
    preview: "linear-gradient(135deg, #8b4513, #d2691e)",
    price: "Free",
    badge: "Coming Soon",
  },
  {
    id: "zen-garden",
    name: "Zen Garden",
    nameZh: "枯山水庭园",
    description: "Japanese zen garden aesthetic. Peaceful, minimal, contemplative.",
    descriptionZh: "日式枯山水庭院美学。平和、极简、沉思。",
    author: "Community",
    preview: "linear-gradient(135deg, #2d5016, #90b77d)",
    price: "Free",
    badge: "Coming Soon",
  },
  {
    id: "retro-game",
    name: "Retro Arcade",
    nameZh: "复古街机厅",
    description: "8-bit arcade machines, pixel art everywhere. Nostalgic gaming vibes.",
    descriptionZh: "8位街机、像素艺术无处不在。复古游戏氛围。",
    author: "Community",
    preview: "linear-gradient(135deg, #ff6b35, #f7c59f)",
    price: "Free",
    badge: "Coming Soon",
  },
];

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || "https://shop.claworld.ai";

export default function ShopPage() {
  const [installed, setInstalled] = useState<Set<string>>(new Set(["default"]));
  const [activeSkin, setActiveSkin] = useState("default");

  function installSkin(skin: Skin) {
    if (!installed.has(skin.id)) {
      setInstalled((prev) => new Set([...prev, skin.id]));
    }
  }

  function activateSkin(skin: Skin) {
    if (installed.has(skin.id)) {
      setActiveSkin(skin.id);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
              Claworld Shop
            </h1>
            <span style={{ padding: "2px 8px", borderRadius: "999px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "11px", fontWeight: 600 }}>
              Beta
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Pixel art skins for your office · {installed.size} installed
          </p>
        </div>
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ExternalLink size={13} /> Browse Full Shop
        </a>
      </div>

      {/* Banner */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(105,68,137,0.08))",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShoppingBag size={28} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              🦞 Pixel Skin Marketplace
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Browse and download pixel art office skins from creators worldwide.
              Import your own or share your designs with the community.
            </div>
          </div>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "auto", flexShrink: 0,
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "var(--radius-md)",
              border: "none", background: "var(--accent)", color: "#fff",
              fontSize: "12px", fontWeight: 600, textDecoration: "none",
            }}
          >
            <ExternalLink size={12} /> Open Shop
          </a>
        </div>
      </div>

      {/* Skin Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {SKINS.map((skin) => {
          const isInstalled = installed.has(skin.id);
          const isActive = activeSkin === skin.id;

          return (
            <div
              key={skin.id}
              className="card"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Preview */}
              <div
                style={{
                  height: "140px",
                  background: skin.preview,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* Pixel art placeholder */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    border: "2px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  🦞
                </div>

                {/* Badge */}
                {skin.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      background: skin.badge === "Active" ? "var(--positive)" : "rgba(0,0,0,0.5)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {skin.badge}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {skin.nameZh}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {skin.name}
                  </div>
                </div>

                <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
                  {skin.descriptionZh}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
                  <span>by {skin.author}</span>
                  <span style={{ fontWeight: 600, color: skin.price === "Free" ? "var(--positive)" : "var(--text-primary)" }}>
                    {skin.price}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {skin.badge === "Coming Soon" ? (
                    <button
                      disabled
                      style={{
                        flex: 1, padding: "7px", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)", background: "var(--surface)",
                        color: "var(--text-muted)", fontSize: "12px", fontWeight: 600,
                        cursor: "not-allowed",
                      }}
                    >
                      Coming Soon
                    </button>
                  ) : isActive ? (
                    <button
                      disabled
                      style={{
                        flex: 1, padding: "7px", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--positive)", background: "var(--positive-soft)",
                        color: "var(--positive)", fontSize: "12px", fontWeight: 600,
                      }}
                    >
                      <Check size={12} style={{ display: "inline", marginRight: "4px" }} /> Active
                    </button>
                  ) : isInstalled ? (
                    <button
                      onClick={() => activateSkin(skin)}
                      style={{
                        flex: 1, padding: "7px", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--accent)", background: "var(--accent-soft)",
                        color: "var(--accent)", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Zap size={12} style={{ display: "inline", marginRight: "4px" }} /> Apply Skin
                    </button>
                  ) : (
                    <button
                      onClick={() => installSkin(skin)}
                      style={{
                        flex: 1, padding: "7px", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)", background: "var(--surface)",
                        color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Download size={12} style={{ display: "inline", marginRight: "4px" }} /> Install
                    </button>
                  )}
                  <a
                    href={SHOP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "7px 10px", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)", background: "var(--surface)",
                      color: "var(--text-muted)", fontSize: "12px",
                      display: "flex", alignItems: "center", textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="card" style={{ padding: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          More skins coming soon · Visit{" "}
          <a href={SHOP_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            shop.claworld.ai
          </a>{" "}
          for the full catalog
        </p>
      </div>
    </div>
  );
}
