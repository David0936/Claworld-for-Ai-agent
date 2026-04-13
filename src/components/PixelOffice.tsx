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

// Z-order: furthest back → closest to camera
// Based on actual content bounds analysis (x, y = pixel position in 1280x720):
// Back wall (high y) → Mid ground → Foreground floor (low y)
// Z-order: furthest back → closest to camera (later in list = drawn last = in front)
// Verified against layer-coords.json psd_bbox: 机柜→沙发→椅子→标识→LOGO
const LAYER_FILES: [string, string][] = [
  ["room-bg", "room-bg.png"],                          // 1. 背景
  ["办公区", "layer-办公区.png"],                      // 2. 办公区
  ["墙左", "layer-墙左.png"],                          // 3. 左墙
  ["墙右", "layer-墙右.png"],                          // 4. 右墙
  ["灯", "layer-灯.png"],                              // 5. 灯
  ["卫生间", "layer-卫生间.png"],                       // 6. 卫生间
  ["显示状态的机器", "layer-显示状态的机器.png"],        // 7. 显示状态机器
  ["电视", "layer-电视.png"],                          // 8. 电视
  ["微波炉", "layer-微波炉.png"],                      // 9. 微波炉
  ["取暖器", "layer-取暖器.png"],                     // 10. 取暖器
  ["跑步机", "layer-跑步机.png"],                     // 11. 跑步机
  ["床", "layer-床.png"],                              // 12. 床
  ["饮水机", "layer-饮水机.png"],                      // 13. 饮水机
  ["沙发地毯", "layer-沙发地毯.png"],                  // 14. 沙发地毯
  ["机柜", "layer-机柜.png"],                          // 15. 机柜
  ["电脑椅子", "layer-电脑椅子.png"],                  // 16. 电脑椅子
  ["龙虾角色", "layer-龙虾角色.png"],                  // 17. 龙虾
  ["小家标识", "layer-小家标识.png"],                  // 18. 小家标识
  ["LOGO文字", "layer-LOGO文字.png"],                  // 19. LOGO文字
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

  // Load asset-specific files when active manifest changes
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
      setLayerUrls(urls);
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

    // Load background first
    const bgUrl = layerUrls["room-bg.png"] ?? "/office-assets/assets/room-bg.png";
    const bgImg = new Image();
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

      // Draw all layers sequentially in z-order
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

        // Status badge for the agent
        const charInfo = coords["龙虾角色"];
        if (!charInfo) return;
        const [ccx, ccy] = charInfo.canvas_center;
        const [cw, ch] = charInfo.canvas_size;
        const tagX = ccx - cw / 2 - 20;
        const tagY = ccy - ch / 2 - 30;
        const name = ag.name;
        ctx.font = "bold 13px monospace";
        const tw = ctx.measureText(name).width;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(tagX, tagY, tw + 16, 20);
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tagX, tagY, tw + 16, 20);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(name, tagX + tw / 2 + 8, tagY + 14);

        // Status dot
        const sc = STATUS_COLORS[ag.status || "offline"];
        ctx.beginPath();
        ctx.arc(tagX + tw + 16 + 8, tagY + 10, 5, 0, Math.PI * 2);
        ctx.fillStyle = sc;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (ag.status === "offline") {
          ctx.globalAlpha = 0.35;
        }
      });
    };
    bgImg.onerror = () => {};
    bgImg.src = bgUrl;
  }, [layerUrls, coords, agents, ready]);

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
