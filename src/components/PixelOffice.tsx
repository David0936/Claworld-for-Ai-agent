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

const LAYER_FILES: [string, string][] = [
  ["room-bg", "room-bg.png"],
  ["墙左", "layer-墙左.png"],
  ["墙右", "layer-墙右.png"],
  ["机柜", "layer-机柜.png"],
  ["显示状态的机器", "layer-显示状态的机器.png"],
  ["左边柜子", "layer-左边柜子.png"],
  ["床", "layer-床.png"],
  ["跑步机", "layer-跑步机.png"],
  ["沙发地毯", "layer-沙发地毯.png"],
  ["办公区", "layer-办公区.png"],
  ["卫生间", "layer-卫生间.png"],
  ["电视", "layer-电视.png"],
  ["电脑椅子", "layer-电脑椅子.png"],
  ["微波炉", "layer-微波炉.png"],
  ["饮水机", "layer-饮水机.png"],
  ["取暖器", "layer-取暖器.png"],
  ["灯", "layer-灯.png"],
  ["吉他", "layer-吉他.png"],
  ["小家标识", "layer-小家标识.png"],
  ["LOGO文字", "layer-LOGO文字.png"],
];

const STATUS_COLORS: Record<string, string> = {
  online: "#00ff88",
  busy: "#ff6b6b",
  idle: "#ffd93d",
  offline: "#555555",
};

const AGENT_POS = { x: 200, y: 510 };

interface Props {
  agents?: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = url;
  });
}

export default function PixelOffice({ agents = [], onAgentClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Record<string, LayerInfo>>({});
  const [layerUrls, setLayerUrls] = useState<Record<string, string>>({});
  const [charUrl, setCharUrl] = useState("/office-assets/assets/char-lobster.png");
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

  // Reload layer URLs when active manifest changes
  useEffect(() => {
    if (!ready) return;
    const assetId = activeManifest?.id ?? "default";

    async function load() {
      const urls: Record<string, string> = {};

      for (const [, filename] of LAYER_FILES) {
        if (assetId === "default") {
          urls[filename] = `/office-assets/assets/${filename}`;
        } else {
          const blob = await getAssetFile(`custom/${assetId}/${filename}`);
          urls[filename] = blob
            ? URL.createObjectURL(blob)
            : `/office-assets/assets/${filename}`;
        }
      }

      const charBlob = await getAssetFile(`custom/${assetId}/char-lobster.png`);
      setLayerUrls(urls);
      setCharUrl(
        charBlob ? URL.createObjectURL(charBlob) : "/office-assets/assets/char-lobster.png"
      );
    }

    load();
  }, [activeManifest, ready]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !ready || Object.keys(layerUrls).length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerW = container.clientWidth;
    const scale = containerW / CANVAS_W;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvas.style.width = `${containerW}px`;
    canvas.style.height = `${CANVAS_H * scale}px`;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background
    const bgImg = new Image();
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

      // Draw layers
      const layerPromises = LAYER_FILES.filter(
        ([, fn]) => fn !== "room-bg.png" && layerUrls[fn]
      ).map(async ([key, fn]) => {
        const img = await loadImg(layerUrls[fn]);
        const info = coords[key];
        if (!info) return;
        const [cx, cy] = info.canvas_center;
        const [iw, ih] = info.canvas_size;
        ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
      });

      Promise.all(layerPromises).then(() => {
        if (!agents[0]) return;
        const ag = agents[0];
        const img = new Image();
        img.onload = () => {
          const cw = 120;
          const ch = 150;
          const cx = AGENT_POS.x - cw / 2;
          const cy = AGENT_POS.y - ch;
          ctx.globalAlpha = ag.status === "offline" ? 0.35 : 1;
          ctx.drawImage(img, cx, cy, cw, ch);
          ctx.globalAlpha = 1;

          const sc = STATUS_COLORS[ag.status || "offline"];
          ctx.font = "bold 13px monospace";
          const tw = ctx.measureText(ag.name).width;
          const tx = AGENT_POS.x - tw / 2 - 8;
          const ty = cy - 10;
          ctx.fillStyle = "rgba(0,0,0,0.75)";
          ctx.fillRect(tx, ty, tw + 16, 20);
          ctx.strokeStyle = ag.color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tx, ty, tw + 16, 20);
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.fillText(ag.name, AGENT_POS.x, ty + 14);
          ctx.beginPath();
          ctx.arc(AGENT_POS.x + 30, cy + 20, 5, 0, Math.PI * 2);
          ctx.fillStyle = sc;
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        img.onerror = () => {};
        img.src = charUrl;
      });
    };
    bgImg.onerror = () => {};
    bgImg.src = layerUrls["room-bg.png"] ?? "/office-assets/assets/room-bg.png";
  }, [layerUrls, charUrl, coords, agents, ready]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "var(--radius-lg, 12px)",
        overflow: "hidden",
        background: "#0a0a14",
        lineHeight: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          imageRendering: "pixelated",
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
          🎨 {activeManifest.name}
        </div>
      )}
    </div>
  );
}
