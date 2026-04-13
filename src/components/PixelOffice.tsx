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
// Later in this list = drawn later = appears in front
// Character (龙虾角色) must be last = closest to camera / most prominent
const LAYER_FILES: [string, string][] = [
  ["room-bg", "room-bg.png"],                          // 1. 背景
  ["墙左", "layer-墙左.png"],                          // 2. 左墙
  ["墙右", "layer-墙右.png"],                          // 3. 右墙
  ["床", "layer-床.png"],                              // 4. 床
  ["跑步机", "layer-跑步机.png"],                      // 5. 跑步机
  ["卫生间", "layer-卫生间.png"],                      // 6. 卫生间
  ["机柜", "layer-机柜.png"],                          // 7. 机柜
  ["显示状态的机器", "layer-显示状态的机器.png"],       // 8. 状态机器
  ["左边柜子", "layer-左边柜子.png"],                  // 9. 左边柜
  ["电视", "layer-电视.png"],                          // 10. 电视
  ["办公区", "layer-办公区.png"],                      // 11. 办公区
  ["微波炉", "layer-微波炉.png"],                      // 12. 微波炉
  ["饮水机", "layer-饮水机.png"],                      // 13. 饮水机
  ["取暖器", "layer-取暖器.png"],                      // 14. 取暖器
  ["吉他", "layer-吉他.png"],                          // 15. 吉他
  ["沙发地毯", "layer-沙发地毯.png"],                  // 16. 沙发+地毯
  ["电脑椅子", "layer-电脑椅子.png"],                  // 17. 电脑椅子
  // 人物龙虾: coords [650, 417] size [417, 447] — 画在椅子"后面"
  // （椅子是前景框架，人物在椅子上方视野里）
  ["龙虾角色", "char-lobster.png"],                    // 18. 龙虾角色
  ["灯", "layer-灯.png"],                              // 19. 灯（墙上方）
  ["小家标识", "layer-小家标识.png"],                  // 20. 小家标识
  ["LOGO文字", "layer-LOGO文字.png"],                  // 21. LOGO文字
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

    // Draw background first
    const bgUrl = layerUrls["room-bg.png"] ?? "/office-assets/assets/room-bg.png";
    const bgImg = new Image();
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

      // Draw all layers in order (LAYER_FILES defines z-order back→front)
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

        // Draw status badge on top of everything (name tag + status dot)
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

        // Global alpha for offline agents
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
