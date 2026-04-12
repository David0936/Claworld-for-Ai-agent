"use client";

import { useEffect, useRef, useState } from "react";

interface Agent {
  id: string;
  name: string;
  status?: string;
  emoji?: string;
  color: string;
}

interface LayerInfo {
  psd_bbox: number[];
  canvas_center: number[];
  canvas_size: number[];
}

// Layer definition: maps layer name to its PNG file and z-order
const LAYER_ORDER = [
  "room-bg",        // 0 — floor / background
  "墙左",           // 1
  "墙右",           // 2
  "办公区",         // 3
  "电脑椅子",       // 4
  "沙发地毯",       // 5
  "电视",           // 6
  "左边柜子",       // 7
  "机柜",           // 8
  "卫生间",         // 9
  "床",             // 10
  "跑步机",         // 11
  "微波炉",         // 12
  "饮水机",         // 13
  "取暖器",         // 14
  "灯",             // 15
  "显示状态的机器", // 16
  "吉他",           // 17
  "小家标识",       // 18 — sign / logo
  "LOGO文字",       // 19 — top-most decoration
  // Dynamic (drawn programmatically):
  // "龙虾角色"      // agent character overlay
];

// Desk positions for agents (x, y in canvas coordinates)
const DESK_POSITIONS = [
  { x: 180, y: 340, label: "Desk 1" },
  { x: 360, y: 340, label: "Desk 2" },
  { x: 540, y: 340, label: "Desk 3" },
  { x: 720, y: 340, label: "Desk 4" },
  { x: 900, y: 340, label: "Desk 5" },
  { x: 1080, y: 340, label: "Desk 6" },
];

const STATUS_COLORS: Record<string, string> = {
  online: "#00ff88",
  busy: "#ff6b6b",
  idle: "#ffd93d",
  offline: "#555555",
};

function getStatusColor(status?: string) {
  return STATUS_COLORS[status || "offline"] || STATUS_COLORS.offline;
}

// Load layer coordinates manifest
async function loadLayerCoords(): Promise<Record<string, LayerInfo>> {
  try {
    const res = await fetch("/office-assets/assets/layer-coords.json");
    return await res.json();
  } catch {
    return {};
  }
}

interface Props {
  agents?: Agent[];
  width?: number;
  height?: number;
  onAgentClick?: (agent: Agent) => void;
  selectedAgentId?: string;
}

export default function PixelOffice({
  agents = [],
  width = 1280,
  height = 720,
  onAgentClick,
  selectedAgentId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coords, setCoords] = useState<Record<string, LayerInfo>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [loading, setLoading] = useState(true);
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load coords
  useEffect(() => {
    loadLayerCoords().then(setCoords);
  }, []);

  // Load all images
  useEffect(() => {
    const imageMap: Record<string, HTMLImageElement> = {};
    let loaded = 0;
    const total = LAYER_ORDER.length + 1; // +1 for char-lobster

    function checkDone() {
      loaded++;
      if (loaded >= total) {
        setLoadedImages(imageMap);
        setLoading(false);
      }
    }

    // Background
    const bg = new Image();
    bg.src = "/office-assets/assets/room-bg.png";
    bg.onload = () => { imageMap["room-bg"] = bg; checkDone(); };
    bg.onerror = () => checkDone();

    // Layers
    const layerNames: Record<string, string> = {
      "墙左": "layer-墙左.png",
      "墙右": "layer-墙右.png",
      "办公区": "layer-办公区.png",
      "电脑椅子": "layer-电脑椅子.png",
      "沙发地毯": "layer-沙发地毯.png",
      "电视": "layer-电视.png",
      "左边柜子": "layer-左边柜子.png",
      "机柜": "layer-机柜.png",
      "卫生间": "layer-卫生间.png",
      "床": "layer-床.png",
      "跑步机": "layer-跑步机.png",
      "微波炉": "layer-微波炉.png",
      "饮水机": "layer-饮水机.png",
      "取暖器": "layer-取暖器.png",
      "灯": "layer-灯.png",
      "显示状态的机器": "layer-显示状态的机器.png",
      "吉他": "layer-吉他.png",
      "小家标识": "layer-小家标识.png",
      "LOGO文字": "layer-LOGO文字.png",
    };

    for (const [layerKey, filename] of Object.entries(layerNames)) {
      const img = new Image();
      img.src = `/office-assets/assets/${filename}`;
      img.onload = () => { imageMap[layerKey] = img; checkDone(); };
      img.onerror = () => checkDone();
    }

    // Character sprite
    const char = new Image();
    char.src = "/office-assets/assets/char-lobster.png";
    char.onload = () => { imageMap["char-lobster"] = char; checkDone(); };
    char.onerror = () => checkDone();
  }, []);

  // Draw everything
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Non-null reference for use in nested closures
    const c = ctx;

    const scaleX = width / 1280;
    const scaleY = height / 720;

    function drawImage(img: HTMLImageElement, layerKey: string) {
      const info = coords[layerKey];
      if (!info) return;
      const [cx, cy] = info.canvas_center;
      const [iw, ih] = info.canvas_size;
      c.drawImage(img, (cx - iw / 2) * scaleX, (cy - ih / 2) * scaleY, iw * scaleX, ih * scaleY);
    }

    // Clear
    c.clearRect(0, 0, width, height);

    // Draw room-bg (tile it or stretch)
    const bg = loadedImages["room-bg"];
    if (bg) {
      c.drawImage(bg, 0, 0, width, height);
    }

    // Draw static layers
    for (const key of LAYER_ORDER) {
      if (key === "room-bg") continue;
      const img = loadedImages[key];
      if (img) drawImage(img, key);
    }

    // Draw agents at desk positions
    const displayAgents = agents.length > 0 ? agents : [];
    displayAgents.forEach((agent, i) => {
      const desk = DESK_POSITIONS[i] || DESK_POSITIONS[0];
      const charImg = loadedImages["char-lobster"];

      if (charImg) {
        // Draw character sprite at desk position
        const charW = 80 * scaleX;
        const charH = 100 * scaleY;
        const charX = (desk.x - charW / 2) * scaleX;
        const charY = (desk.y - charH) * scaleY;

        c.save();
        c.globalAlpha = agent.status === "offline" ? 0.4 : 1.0;
        c.drawImage(charImg, charX, charY, charW, charH);

        // Draw agent name above character
        c.globalAlpha = 0.85;
        c.fillStyle = "rgba(0,0,0,0.6)";
        const textWidth = c.measureText(agent.name).width;
        c.fillRect(charX + charW / 2 - textWidth / 2 - 4, charY - 18 * scaleY, textWidth + 8, 16 * scaleY);
        c.fillStyle = agent.color || "#00d4aa";
        c.font = `${Math.round(10 * scaleX)}px monospace`;
        c.textAlign = "center";
        c.fillText(agent.name, charX + charW / 2, charY - 5 * scaleY);
        c.restore();

        // Status dot
        c.beginPath();
        c.arc((desk.x + 30) * scaleX, (desk.y - charH + 10) * scaleY, 6 * scaleX, 0, Math.PI * 2);
        c.fillStyle = getStatusColor(agent.status);
        c.fill();
        c.strokeStyle = "#000";
        c.lineWidth = 1;
        c.stroke();
      }

      // Invisible hit area for click
      const hitX = (desk.x - 40) * scaleX;
      const hitY = (desk.y - 100) * scaleY;
      const hitW = 80 * scaleX;
      const hitH = 100 * scaleY;
      (canvas as any).__agentHitAreas = (canvas as any).__agentHitAreas || [];
      (canvas as any).__agentHitAreas[i] = { x: hitX, y: hitY, w: hitW, h: hitH, agent };
    });

    // Hover tooltip
    if (hoveredAgent) {
      const idx = displayAgents.indexOf(hoveredAgent);
      if (idx >= 0) {
        const desk = DESK_POSITIONS[idx] || DESK_POSITIONS[0];
        const tx = desk.x * scaleX;
        const ty = (desk.y - 120) * scaleY;
        const statusColor = getStatusColor(hoveredAgent.status);
        c.save();
        c.fillStyle = "rgba(10,10,20,0.9)";
        const tw = Math.max(80, c.measureText(hoveredAgent.name).width + 24);
        c.beginPath();
        c.roundRect(tx - tw / 2, ty - 28 * scaleY, tw, 36 * scaleY, 6);
        c.fill();
        c.strokeStyle = hoveredAgent.color || "#00d4aa";
        c.lineWidth = 1.5;
        c.stroke();
        c.fillStyle = "#fff";
        c.font = `bold ${Math.round(11 * scaleX)}px monospace`;
        c.textAlign = "center";
        c.fillText(hoveredAgent.name, tx, ty - 10 * scaleY);
        c.fillStyle = statusColor;
        c.font = `${Math.round(9 * scaleX)}px monospace`;
        c.fillText(hoveredAgent.status || "offline", tx, ty - 0 * scaleY);
        c.restore();
      }
    }
  }, [loading, loadedImages, coords, agents, width, height, hoveredAgent]);

  // Mouse interaction
  function getAgentAtPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): Agent | null {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const hitAreas: Array<{ x: number; y: number; w: number; h: number; agent: Agent }> = (canvas as any).__agentHitAreas || [];
    for (const hit of hitAreas) {
      if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) {
        return hit.agent;
      }
    }
    return null;
  }

  if (loading) {
    return (
      <div style={{
        width: "100%", height: `${Math.round((height / width) * 100)}%`,
        maxHeight: height,
        background: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)", fontSize: "13px", borderRadius: "var(--radius-lg)"
      }}>
        Loading office assets...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: "pointer",
          borderRadius: "var(--radius-lg)",
        }}
        onMouseMove={(e) => {
          const agent = getAgentAtPoint(e.currentTarget, e.clientX, e.clientY);
          setHoveredAgent(agent);
          setMousePos({ x: e.clientX - (e.currentTarget.getBoundingClientRect().left), y: e.clientY - e.currentTarget.getBoundingClientRect().top });
        }}
        onMouseLeave={() => setHoveredAgent(null)}
        onClick={(e) => {
          const agent = getAgentAtPoint(e.currentTarget, e.clientX, e.clientY);
          if (agent && onAgentClick) onAgentClick(agent);
        }}
      />
      {hoveredAgent && (
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          padding: "6px 12px",
          background: "rgba(10,10,20,0.85)",
          border: `1px solid ${hoveredAgent.color || "#00d4aa"}`,
          borderRadius: "var(--radius-md)",
          fontSize: "11px",
          color: "#fff",
          pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700 }}>{hoveredAgent.name}</div>
          <div style={{ color: getStatusColor(hoveredAgent.status), textTransform: "capitalize" }}>
            ● {hoveredAgent.status || "offline"}
          </div>
        </div>
      )}
    </div>
  );
}
