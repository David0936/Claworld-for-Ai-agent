"use client";

import { useEffect, useRef, useState } from "react";

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

// Layer z-order: back → front
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
  ["饮水机", "layer-饮水机-ps.png"],
  ["取暖器", "layer-取暖器-ps.png"],
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

// Agent sits on the sofa (bottom-left area)
const AGENT_POS = { x: 200, y: 510 };

interface Props {
  agents?: Agent[];
  width?: number;
  height?: number;
  onAgentClick?: (agent: Agent) => void;
}

export default function PixelOffice({ agents = [], onAgentClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Record<string, LayerInfo>>({});
  const [loaded, setLoaded] = useState(false);

  // Load coords
  useEffect(() => {
    fetch("/office-assets/assets/layer-coords.json")
      .then((r) => r.json())
      .then((data) => {
        setCoords(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Load images and draw
  useEffect(() => {
    if (!loaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Non-null reference for closures
    const c = ctx;

    const images: Record<string, HTMLImageElement> = {};
    let pending = LAYER_FILES.length + 1; // +1 for char-lobster

    function done() {
      pending--;
      if (pending > 0) return;

      // Draw
      const containerW = containerRef.current?.clientWidth || 900;
      const scale = containerW / CANVAS_W;

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${CANVAS_H * scale}px`;

      // Clear
      c.clearRect(0, 0, CANVAS_W, CANVAS_H);

      function draw(key: string, img: HTMLImageElement) {
        const info = coords[key];
        if (!info) return;
        const [cx, cy] = info.canvas_center;
        const [iw, ih] = info.canvas_size;
        c.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
      }

      // Background
      if (images["room-bg"]) {
        c.drawImage(images["room-bg"], 0, 0, CANVAS_W, CANVAS_H);
      }

      // Layers in order
      for (const [key, filename] of LAYER_FILES) {
        if (key === "room-bg" || !images[key]) continue;
        draw(key, images[key]);
      }

      // Agent character
      const mainAgent = agents[0];
      if (mainAgent && images["char-lobster"]) {
        const charImg = images["char-lobster"];
        const charW = 120;
        const charH = 150;
        const charX = AGENT_POS.x - charW / 2;
        const charY = AGENT_POS.y - charH;

        c.globalAlpha = mainAgent.status === "offline" ? 0.35 : 1;
        c.drawImage(charImg, charX, charY, charW, charH);
        c.globalAlpha = 1;

        // Name tag
        const statusColor = STATUS_COLORS[mainAgent.status || "offline"];
        const name = mainAgent.name;
        c.font = "bold 13px monospace";
        const tw = c.measureText(name).width;
        const tagX = AGENT_POS.x - tw / 2 - 8;
        const tagY = charY - 10;
        c.fillStyle = "rgba(0,0,0,0.75)";
        c.fillRect(tagX, tagY, tw + 16, 20);
        c.strokeStyle = mainAgent.color;
        c.lineWidth = 1.5;
        c.strokeRect(tagX, tagY, tw + 16, 20);
        c.fillStyle = "#fff";
        c.textAlign = "center";
        c.fillText(name, AGENT_POS.x, tagY + 14);

        // Status dot
        c.beginPath();
        c.arc(AGENT_POS.x + 30, charY + 20, 5, 0, Math.PI * 2);
        c.fillStyle = statusColor;
        c.fill();
        c.strokeStyle = "#000";
        c.lineWidth = 1;
        c.stroke();
      }
    }

    // Load background
    const bg = new window.Image();
    bg.src = "/office-assets/assets/room-bg.png";
    bg.onload = () => { images["room-bg"] = bg; done(); };
    bg.onerror = () => done();

    // Load layers
    for (const [key, filename] of LAYER_FILES) {
      if (key === "room-bg") continue;
      const img = new window.Image();
      img.src = `/office-assets/assets/${filename}`;
      img.onload = () => { images[key] = img; done(); };
      img.onerror = () => done();
    }

    // Load character
    const char = new window.Image();
    char.src = "/office-assets/assets/char-lobster.png";
    char.onload = () => { images["char-lobster"] = char; done(); };
    char.onerror = () => done();
  }, [loaded, coords, agents]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "var(--radius-lg)",
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
      {!loaded && (
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
    </div>
  );
}
