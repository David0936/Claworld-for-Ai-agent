"use client";

import { useEffect, useRef, useState } from "react";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { getAssetFile } from "@/lib/asset-storage";

interface Agent {
  id: string;
  name: string;
  status?: string;
  color: string;
}

interface LayerInfo {
  psd_bbox: number[];
  canvas_center: number[];
  canvas_size: number[];
}

const CANVAS_W = 1280;
const CANVAS_H = 720;

// ═══════════════════════════════════════════════════════════════
// Character Slot Definitions
// 3 fixed positions where characters can appear.
// Each slot has a sprite that can be swapped per agent state.
// ═══════════════════════════════════════════════════════════════
interface CharacterSlot {
  id: string;
  label: string;
  // Key in layer-coords.json for position/size
  coordsKey: string;
  // Default sprite filename (can be swapped per state)
  sprites: Record<string, string>;
  // Layers that must be drawn IN FRONT of the character (occlusion)
  foregroundLayers: string[];
}

const CHARACTER_SLOTS: CharacterSlot[] = [
  {
    id: "sofa",
    label: "沙发",
    coordsKey: "龙虾角色",
    sprites: {
      idle: "layer-龙虾角色.png",
      busy: "layer-龙虾角色.png",       // future: unique sprite per state
      thinking: "layer-龙虾角色.png",
      offline: "layer-龙虾角色.png",
    },
    foregroundLayers: [],  // nothing occludes sofa character
  },
  {
    id: "office",
    label: "办公区",
    coordsKey: "龙虾角色-office",       // future coords entry
    sprites: {
      idle: "layer-龙虾角色.png",       // future: char-lobster-office.png
    },
    foregroundLayers: ["电脑椅子"],      // chair drawn on top
  },
  {
    id: "bed",
    label: "床",
    coordsKey: "龙虾角色-bed",          // future coords entry
    sprites: {
      idle: "layer-龙虾角色.png",       // future: char-lobster-bed.png
    },
    foregroundLayers: [],
  },
];

const STATUS_COLORS: Record<string, string> = {
  online: "#00ff88",
  busy: "#ff6b6b",
  idle: "#ffd93d",
  offline: "#555555",
};

interface Props {
  agents?: Agent[];
  onAgentClick?: (agent: Agent) => void;
  darkBg?: boolean;
}

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = url;
  });
}

export default function PixelOffice({ agents = [], onAgentClick, darkBg = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Record<string, LayerInfo>>({});
  const [ready, setReady] = useState(false);

  const { manifest: activeManifest } = useActiveAsset();

  // Load coords
  useEffect(() => {
    fetch("/office-assets/assets/layer-coords.json")
      .then((r) => r.json())
      .then((data) => setCoords(data))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Resolve asset URL (supports custom skin packs)
  function assetUrl(filename: string): string {
    return `/office-assets/assets/${filename}`;
  }

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerW = container.clientWidth;
    const scale = containerW / CANVAS_W;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvas.style.width = `${containerW}px`;
    canvas.style.height = `${CANVAS_H * scale}px`;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // ── 1. Background (pre-composited, all static elements, no characters) ──
    const bgImg = new Image();
    bgImg.onload = async () => {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

      // ── 2. Character slots ──
      // Currently only slot[0] (sofa) is active with the lobster
      const slot = CHARACTER_SLOTS[0]; // sofa slot
      const agent = agents[0];
      const agentStatus = agent?.status || "idle";
      const spriteFile = slot.sprites[agentStatus] || slot.sprites.idle;
      const charInfo = coords[slot.coordsKey];

      if (charInfo && spriteFile) {
        const charImg = await loadImg(assetUrl(spriteFile));
        if (charImg.naturalWidth) {
          const [cx, cy] = charInfo.canvas_center;
          const [iw, ih] = charInfo.canvas_size;
          ctx.drawImage(charImg, cx - iw / 2, cy - ih / 2, iw, ih);
        }
      }

      // ── 3. Agent name badge ──
      if (agent && charInfo) {
        const [ccx, ccy] = charInfo.canvas_center;
        const [, ch] = charInfo.canvas_size;
        const tagX = ccx;
        const tagY = ccy - ch / 2 - 30;
        const name = agent.name;

        ctx.font = "bold 13px monospace";
        const tw = ctx.measureText(name).width;
        const badgeW = tw + 24;
        const badgeH = 20;

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.roundRect(tagX - badgeW / 2, tagY, badgeW, badgeH, 4);
        ctx.fill();
        ctx.strokeStyle = agent.color || "#00d4aa";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Status dot
        const sc = STATUS_COLORS[agent.status || "offline"] || STATUS_COLORS.offline;
        ctx.beginPath();
        ctx.arc(tagX - badgeW / 2 + 10, tagY + badgeH / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = sc;
        ctx.fill();

        // Name
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(name, tagX - badgeW / 2 + 20, tagY + badgeH / 2 + 4);
      }
    };
    bgImg.onerror = () => {};
    bgImg.src = assetUrl("room-bg.png");
  }, [coords, agents, ready, darkBg]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "var(--radius-lg, 12px)",
        overflow: "hidden",
        background: darkBg ? "#0a0a14" : "#f0f0f0",
        lineHeight: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          imageRendering: "auto",
          cursor: agents[0] ? "pointer" : "default",
        }}
        onClick={() => {
          if (agents[0]) onAgentClick?.(agents[0]);
        }}
      />
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "13px",
            fontFamily: "monospace",
          }}
        >
          Loading office...
        </div>
      )}
      {ready && activeManifest && activeManifest.id !== "default" && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,56,92,0.4)",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontFamily: "monospace",
            color: "#FF385C",
          }}
        >
          {activeManifest.name}
        </div>
      )}
    </div>
  );
}
