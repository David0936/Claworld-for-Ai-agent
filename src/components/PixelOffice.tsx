"use client";

import { useEffect, useState } from "react";

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

const CANVAS_W = 1280;
const CANVAS_H = 720;

// Layer order: back → front (bottom of array = top-most)
// Order matches how layers should visually stack in the office
const LAYER_FILES: [string, string][] = [
  ["room-bg", "room-bg.png"],
  // === 背景层 ===
  ["墙左", "layer-墙左.png"],
  ["墙右", "layer-墙右.png"],
  ["机柜", "layer-机柜.png"],
  ["显示状态的机器", "layer-显示状态的机器.png"],
  // === 中景家具层 ===
  ["左边柜子", "layer-左边柜子.png"],
  ["床", "layer-床.png"],
  ["跑步机", "layer-跑步机.png"],
  ["沙发地毯", "layer-沙发地毯.png"],   // 沙发在地毯上
  ["办公区", "layer-办公区.png"],
  ["卫生间", "layer-卫生间.png"],
  // === 前景细节层 ===
  ["电视", "layer-电视.png"],
  ["电脑椅子", "layer-电脑椅子.png"],
  ["微波炉", "layer-微波炉.png"],
  ["饮水机", "layer-饮水机-ps.png"],
  ["取暖器", "layer-取暖器-ps.png"],
  ["灯", "layer-灯.png"],
  ["吉他", "layer-吉他.png"],
  // === 角色层（agent 角色在这里）===
  // agent 坐在沙发上 → 左下区域
  // === 标识层 ===
  ["小家标识", "layer-小家标识.png"],
  ["LOGO文字", "layer-LOGO文字.png"],
];

const STATUS_COLORS: Record<string, string> = {
  online: "#00ff88",
  busy: "#ff6b6b",
  idle: "#ffd93d",
  offline: "#555555",
};

// 角色坐在沙发上的位置（相对于 canvas 1280x720）
const AGENT_POSITION = {
  left: "30%",  // 沙发在左下
  top: "62%",   // 下半部分
};

interface Props {
  agents?: Agent[];
  width?: number;
  height?: number;
  onAgentClick?: (agent: Agent) => void;
  selectedAgentId?: string;
}

export default function PixelOffice({
  agents = [],
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
        setLoaded(true);
      });
  }, []);

  // 计算图层绝对位置
  function getLayerStyle(key: string) {
    const info = coords[key];
    if (!info) {
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
  // 只取第一个 agent 显示
  const mainAgent = agents[0];
  const statusColor = STATUS_COLORS[mainAgent?.status || "offline"];

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

      {/* 背景层 */}
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

      {/* 静态层叠（从底到顶） */}
      {loaded &&
        LAYER_FILES.filter(([key]) => key !== "room-bg").map(([key, filename]) => (
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
        ))}

      {/* 角色层（agent 坐在沙发上） */}
      {loaded && mainAgent && (
        <div
          style={{
            position: "absolute",
            left: AGENT_POSITION.left,
            top: AGENT_POSITION.top,
            transform: "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: mainAgent ? "pointer" : "default",
            opacity: mainAgent.status === "offline" ? 0.35 : 1,
            transition: "opacity 0.3s",
            zIndex: 20,
          }}
          onClick={() => onAgentClick?.(mainAgent)}
        >
          {/* 龙虾角色精灵 */}
          <img
            src="/office-assets/assets/char-lobster.png"
            alt={mainAgent.name}
            style={{
              width: "72px",
              height: "auto",
              imageRendering: "pixelated",
              filter: mainAgent.status === "busy" ? "brightness(1.1) drop-shadow(0 0 6px #ff6b6b)" : "none",
            }}
          />

          {/* 名字标签 */}
          <div
            style={{
              marginTop: "3px",
              padding: "2px 8px",
              background: "rgba(0,0,0,0.8)",
              border: `1.5px solid ${mainAgent.color}`,
              borderRadius: "4px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#fff",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {mainAgent.name}
          </div>

          {/* 状态指示器 */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: statusColor,
                border: "1.5px solid #000",
                boxShadow: mainAgent.status === "online" ? `0 0 6px ${statusColor}` : "none",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                color: statusColor,
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              {mainAgent.status || "offline"}
            </span>
          </div>
        </div>
      )}

      {/* 右下角状态信息 */}
      {loaded && mainAgent && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            padding: "5px 10px",
            background: "rgba(0,0,0,0.75)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "10px",
            color: "var(--text-muted)",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: statusColor,
              display: "inline-block",
            }}
          />
          {mainAgent.name}
        </div>
      )}
    </div>
  );
}
