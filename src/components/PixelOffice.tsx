"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

// Canvas reference size
const CANVAS_W = 1280;
const CANVAS_H = 720;

// Layer z-order (back to front)
const LAYER_FILES: [string, string][] = [
  ["room-bg", "room-bg.png"],
  ["墙左", "layer-墙左.png"],
  ["墙右", "layer-墙右.png"],
  ["办公区", "layer-办公区.png"],
  ["电脑椅子", "layer-电脑椅子.png"],
  ["沙发地毯", "layer-沙发地毯.png"],
  ["电视", "layer-电视.png"],
  ["左边柜子", "layer-左边柜子.png"],
  ["机柜", "layer-机柜.png"],
  ["卫生间", "layer-卫生间.png"],
  ["床", "layer-床.png"],
  ["跑步机", "layer-跑步机.png"],
  ["微波炉", "layer-微波炉.png"],
  ["饮水机", "layer-饮水机-ps.png"],
  ["取暖器", "layer-取暖器-ps.png"],
  ["灯", "layer-灯.png"],
  ["显示状态的机器", "layer-显示状态的机器.png"],
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

const DESK_POSITIONS = [
  { x: 180, y: 370 },
  { x: 360, y: 370 },
  { x: 540, y: 370 },
  { x: 720, y: 370 },
  { x: 900, y: 370 },
  { x: 1080, y: 370 },
];

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
}: Props) {
  const [coords, setCoords] = useState<Record<string, LayerInfo>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/office-assets/assets/layer-coords.json")
      .then((r) => r.json())
      .then((data) => {
        setCoords(data);
        setLoaded(true);
      })
      .catch(() => {
        // If coords fail, just show background
        setLoaded(true);
      });
  }, []);

  function getLayerStyle(key: string) {
    const info = coords[key];
    if (!info) {
      // Fallback: full canvas size centered
      return {
        position: "absolute" as const,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      };
    }
    const [cx, cy] = info.canvas_center;
    const [iw, ih] = info.canvas_size;
    // Convert canvas coords to percentage
    const leftPct = ((cx - iw / 2) / CANVAS_W) * 100;
    const topPct = ((cy - ih / 2) / CANVAS_H) * 100;
    const wPct = (iw / CANVAS_W) * 100;
    const hPct = (ih / CANVAS_H) * 100;
    return {
      position: "absolute" as const,
      left: `${leftPct}%`,
      top: `${topPct}%`,
      width: `${wPct}%`,
      height: `${hPct}%`,
    };
  }

  const aspectRatio = CANVAS_H / CANVAS_W;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${aspectRatio * 100}%`,
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        background: "#0a0a14",
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          Loading office...
        </div>
      )}

      {/* Render each layer as img */}
      {loaded &&
        LAYER_FILES.map(([key, filename]) => {
          // Skip room-bg — it's the background div
          if (key === "room-bg") return null;
          return (
            <img
              key={key}
              src={`/office-assets/assets/${filename}`}
              alt={key}
              loading="lazy"
              style={{
                ...getLayerStyle(key),
                objectFit: "fill",
                pointerEvents: "none",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          );
        })}

      {/* Background (room-bg.png) — fills entire container */}
      {loaded && (
        <img
          src="/office-assets/assets/room-bg.png"
          alt="Office Background"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.background = "#1a1a2e";
          }}
        />
      )}

      {/* Agent characters */}
      {loaded &&
        agents.map((agent, i) => {
          const desk = DESK_POSITIONS[i] || DESK_POSITIONS[0];
          const leftPct = (desk.x / CANVAS_W) * 100;
          const topPct = (desk.y / CANVAS_H) * 100;
          const statusColor = STATUS_COLORS[agent.status || "offline"];

          return (
            <div
              key={agent.id}
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                opacity: agent.status === "offline" ? 0.4 : 1,
              }}
              onClick={() => onAgentClick?.(agent)}
            >
              {/* Agent sprite */}
              <img
                src="/office-assets/assets/char-lobster.png"
                alt={agent.name}
                style={{
                  width: "64px",
                  height: "auto",
                  imageRendering: "pixelated",
                  filter: agent.status === "busy" ? "brightness(1.2)" : "none",
                }}
              />
              {/* Name tag */}
              <div
                style={{
                  marginTop: "2px",
                  padding: "2px 6px",
                  background: "rgba(0,0,0,0.75)",
                  border: `1.5px solid ${agent.color}`,
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  maxWidth: "80px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                }}
              >
                {agent.name}
              </div>
              {/* Status dot */}
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: statusColor,
                  border: "1.5px solid #000",
                  marginTop: "2px",
                }}
              />
            </div>
          );
        })}

      {/* Agent count badge */}
      {loaded && agents.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            padding: "4px 8px",
            background: "rgba(0,0,0,0.7)",
            borderRadius: "6px",
            fontSize: "10px",
            color: "var(--text-muted)",
            fontFamily: "monospace",
          }}
        >
          {agents.filter((a) => a.status !== "offline").length}/{agents.length} online
        </div>
      )}
    </div>
  );
}
