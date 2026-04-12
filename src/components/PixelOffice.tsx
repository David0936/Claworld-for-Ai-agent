"use client";

import { useEffect, useRef, useState } from "react";

export interface OfficeAgent {
  id: string;
  name: string;
  status: "online" | "busy" | "idle" | "offline";
  emoji?: string;
  avatar?: string; // base64 image
  color?: string;
}

interface PixelOfficeProps {
  agents: OfficeAgent[];
  width?: number;
  height?: number;
}

// Pixel art palette (retro computer room vibe)
const PALETTE = {
  floor: "#1a1a2e",
  floorTile: "#16213e",
  wall: "#0f3460",
  wallAccent: "#1a4a6e",
  desk: "#533483",
  deskTop: "#694489",
  chair: "#7b68ee",
  monitor: "#00d4aa",
  monitorGlow: "#00ffcc",
  screen: "#001a1a",
  plant: "#00a878",
  plantDark: "#007a5e",
  pot: "#8b4513",
  window: "#1e3a5f",
  windowGlow: "#4a9eff",
  shelf: "#6b5b95",
  book: "#e94560",
  book2: "#f7dc6f",
  book3: "#58d68d",
  carpet: "#2c1654",
  lamp: "#f4d03f",
  lampOff: "#7d6608",
  cable: "#555",
  coffee: "#8b4513",
  mug: "#cd853f",
};

// Draw pixel rect helper
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Draw text pixel-style
function pxText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, scale = 1) {
  ctx.fillStyle = color;
  ctx.font = `${8 * scale}px monospace`;
  ctx.fillText(text, Math.round(x), Math.round(y));
}

// Draw a simple pixel character
function drawPixelCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  status: OfficeAgent["status"],
  color: string,
  emoji?: string,
  avatarBase64?: string
) {
  const s = scale;
  const bodyColor = status === "offline" ? "#555" : color;
  const headY = y;

  // Head (pixel face)
  px(ctx, x + s, headY, s * 6, s * 6, bodyColor);
  px(ctx, x + s * 2, headY - s, s * 4, s * 2, bodyColor); // top of head

  // Eyes
  if (status !== "offline") {
    px(ctx, x + s * 2, headY + s * 2, s, s, "#fff");
    px(ctx, x + s * 5, headY + s * 2, s, s, "#fff");
    px(ctx, x + s * 2, headY + s * 3, s, s, "#000"); // left pupil
    px(ctx, x + s * 5, headY + s * 3, s, s, "#000"); // right pupil
  } else {
    px(ctx, x + s * 2, headY + s * 3, s, s * 2, "#888");
    px(ctx, x + s * 5, headY + s * 3, s, s * 2, "#888");
  }

  // Body
  px(ctx, x + s, headY + s * 6, s * 6, s * 6, bodyColor);

  // Arms
  px(ctx, x, headY + s * 7, s, s * 3, bodyColor);
  px(ctx, x + s * 7, headY + s * 7, s, s * 3, bodyColor);

  // Status indicator
  const statusColors: Record<string, string> = {
    online: "#00ff88",
    busy: "#ff6b6b",
    idle: "#ffd93d",
    offline: "#555555",
  };
  px(ctx, x + s * 3, headY - s * 2, s * 2, s * 2, statusColors[status] || "#555");

  // Typing animation for busy
  if (status === "busy") {
    px(ctx, x - s, headY + s * 9, s * 2, s, statusColors.busy);
  }

  // Draw avatar image as pixelated overlay if available
  if (avatarBase64 && status !== "offline") {
    const img = new Image();
    img.src = avatarBase64;
    // Clip to head area
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, headY - s, s * 8, s * 8);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x, headY - s, s * 8, s * 8);
    ctx.restore();
  }
}

// Draw office desk with computer
function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = scale;
  // Desk surface
  px(ctx, x, y, s * 12, s * 2, PALETTE.deskTop);
  // Desk legs
  px(ctx, x, y + s * 2, s, s * 6, PALETTE.desk);
  px(ctx, x + s * 11, y + s * 2, s, s * 6, PALETTE.desk);
  // Monitor
  px(ctx, x + s * 3, y - s * 10, s * 6, s * 7, PALETTE.monitor);
  px(ctx, x + s * 4, y - s * 9, s * 4, s * 4, PALETTE.screen);
  // Monitor glow
  px(ctx, x + s * 4, y - s * 9, s * 4, s * 1, PALETTE.monitorGlow);
  // Monitor stand
  px(ctx, x + s * 5, y - s * 3, s * 2, s * 3, "#444");
  // Keyboard
  px(ctx, x + s * 3, y - s * 1, s * 5, s, "#333");
  // Coffee mug
  px(ctx, x + s * 10, y - s * 3, s * 2, s * 3, PALETTE.mug);
  px(ctx, x + s * 11, y - s * 2, s, s, "#8b4513");
}

// Draw plant
function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = scale;
  px(ctx, x + s, y, s * 2, s * 4, PALETTE.pot);
  px(ctx, x, y - s * 3, s * 4, s * 4, PALETTE.plant);
  px(ctx, x + s, y - s * 5, s * 2, s * 3, PALETTE.plantDark);
  px(ctx, x - s, y - s * 2, s * 2, s * 2, PALETTE.plant);
  px(ctx, x + s * 3, y - s * 2, s * 2, s * 2, PALETTE.plantDark);
}

// Draw bookshelf
function drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, height: number) {
  const s = scale;
  px(ctx, x, y, s * 2, height * s, PALETTE.shelf);
  for (let row = 0; row < Math.floor(height / 4); row++) {
    const bookColors = [PALETTE.book, PALETTE.book2, PALETTE.book3, "#e74c3c", "#3498db"];
    for (let col = 0; col < 2; col++) {
      px(ctx, x + col * s + s * 0.2, y + row * s * 4 + s, s * 0.8, s * 3, bookColors[(row + col) % bookColors.length]);
    }
  }
}

// Draw window
function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, w: number, h: number) {
  const s = scale;
  px(ctx, x, y, w * s, h * s, PALETTE.window);
  // Window frame
  px(ctx, x, y, w * s, s, PALETTE.wall);
  px(ctx, x, y + h * s - s, w * s, s, PALETTE.wall);
  px(ctx, x, y, s, h * s, PALETTE.wall);
  px(ctx, x + w * s - s, y, s, h * s, PALETTE.wall);
  // Window cross
  px(ctx, x + Math.floor(w / 2) * s, y, s, h * s, PALETTE.wall);
  px(ctx, x, y + Math.floor(h / 2) * s, w * s, s, PALETTE.wall);
  // Sky glow
  px(ctx, x + s, y + s, (w - 2) * s, (h - 2) * s, PALETTE.windowGlow + "44");
}

export default function PixelOffice({ agents, width = 800, height = 500 }: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 4; // pixel scale
    canvas.width = width;
    canvas.height = height;

    // Disable image smoothing for pixel art look
    ctx.imageSmoothingEnabled = false;

    // Background - floor
    for (let row = 0; row < height / scale; row++) {
      for (let col = 0; col < width / scale; col++) {
        const isLight = (row + col) % 2 === 0;
        px(ctx, col * scale, row * scale, scale, scale, isLight ? PALETTE.floor : PALETTE.floorTile);
      }
    }

    // Back wall
    px(ctx, 0, 0, width, Math.floor(120 / scale) * scale, PALETTE.wall);
    px(ctx, 0, Math.floor(120 / scale) * scale - scale, width, scale, PALETTE.wallAccent);

    // Window on the back wall
    drawWindow(ctx, Math.floor(width * 0.3 / scale) * scale, Math.floor(20 / scale) * scale, scale, 8, 20);

    // Carpet in center
    for (let row = Math.floor(140 / scale); row < Math.floor(200 / scale); row++) {
      for (let col = Math.floor(200 / scale); col < Math.floor(600 / scale); col++) {
        const isLight = (row + col) % 3 === 0;
        px(ctx, col * scale, row * scale, scale, scale, isLight ? "#2c1654" : "#231344");
      }
    }

    // Plants in corners
    drawPlant(ctx, Math.floor(20 / scale) * scale, Math.floor(80 / scale) * scale, scale);
    drawPlant(ctx, Math.floor((width - 50) / scale) * scale, Math.floor(80 / scale) * scale, scale);

    // Bookshelf on the right
    drawShelf(ctx, Math.floor((width - 40) / scale) * scale, Math.floor(30 / scale) * scale, scale, 16);

    // Draw desks (one per agent, up to 4)
    const deskPositions = [
      { x: Math.floor(60 / scale) * scale, y: Math.floor(160 / scale) * scale },
      { x: Math.floor(220 / scale) * scale, y: Math.floor(160 / scale) * scale },
      { x: Math.floor(380 / scale) * scale, y: Math.floor(160 / scale) * scale },
      { x: Math.floor(540 / scale) * scale, y: Math.floor(160 / scale) * scale },
    ];

    const onlineAgents = agents.slice(0, 4);
    for (let i = 0; i < deskPositions.length; i++) {
      const pos = deskPositions[i];
      drawDesk(ctx, pos.x, pos.y, scale);

      if (i < onlineAgents.length) {
        const agent = onlineAgents[i];
        // Draw character at desk
        const charX = pos.x + scale * 1;
        const charY = pos.y - scale * 4;
        drawPixelCharacter(ctx, charX, charY, scale, agent.status, agent.color || "#00d4aa", agent.emoji, agent.avatar);

        // Name tag
        pxText(ctx, agent.name.substring(0, 8), pos.x, pos.y + scale * 10, "#fff", 1);

        // Status dot
        const statusColors: Record<string, string> = { online: "#00ff88", busy: "#ff6b6b", idle: "#ffd93d", offline: "#555" };
        px(ctx, pos.x + scale * 11, pos.y + scale * 9, scale, scale, statusColors[agent.status] || "#555");
      } else {
        // Empty desk - "vacant" sign
        px(ctx, pos.x + scale * 2, pos.y - scale * 2, scale * 8, scale * 2, "#333");
        pxText(ctx, "[ vacant ]", pos.x + scale * 2, pos.y - scale * 1, "#666", 1);
      }
    }

    // Floor decorations - cable runs
    px(ctx, Math.floor(80 / scale) * scale, Math.floor(220 / scale) * scale, Math.floor(560 / scale) * scale, scale, PALETTE.cable);

    // Clock on wall
    const clockX = Math.floor((width - 30) / scale) * scale;
    px(ctx, clockX, Math.floor(30 / scale) * scale, scale * 4, scale * 4, "#f4d03f");
    px(ctx, clockX + scale, Math.floor(30 / scale) * scale, scale * 2, scale * 4, PALETTE.wall);
    const now = new Date();
    pxText(ctx, `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`, clockX - scale * 2, Math.floor(38 / scale) * scale, "#fff", 0.8);

    // "Claworld Office" sign
    const signX = Math.floor(width * 0.05 / scale) * scale;
    px(ctx, signX, Math.floor(15 / scale) * scale, scale * 12, scale * 4, "#694489");
    pxText(ctx, "CLA WORLD OFFICE", signX + scale, Math.floor(22 / scale) * scale, "#fff", 1);

    // Clickable areas: for now we just track the active agent
  }, [agents, width, height, activeAgent]);

  return (
    <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "auto", imageRendering: "pixelated" }}
        onClick={(e) => {
          // Simple click detection for agents
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const scaleX = canvasRef.current!.width / rect.width;
          const scaleY = canvasRef.current!.height / rect.height;
          const x = (e.clientX - rect.left) * scaleX;
          const y = (e.clientY - rect.top) * scaleY;

          // Check which desk was clicked
          const deskXs = [60, 220, 380, 540];
          for (let i = 0; i < deskXs.length; i++) {
            if (x >= deskXs[i] && x <= deskXs[i] + 100) {
              const agent = agents[i];
              if (agent) setActiveAgent(activeAgent === agent.id ? null : agent.id);
              break;
            }
          }
        }}
      />

      {/* Active agent tooltip */}
      {activeAgent && (() => {
        const agent = agents.find((a) => a.id === activeAgent);
        if (!agent) return null;
        const statusLabels: Record<string, string> = {
          online: "在线",
          busy: "忙碌中",
          idle: "空闲",
          offline: "离线",
        };
        return (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              fontSize: "12px",
              color: "var(--text-primary)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>{agent.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              {statusLabels[agent.status] || agent.status}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
