"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const VALLEY_ASSETS = "/valley-assets";

// Map: 5504×3072 px → viewport 1280×720
// Show the office area (bottom-right of map)
const MAP_W = 5504;
const MAP_H = 3072;
const VIEW_W = 1280;
const VIEW_H = 720;
const CAM_X = 4912;
const CAM_Y = 2176;
const SCALE = Math.min(VIEW_W / (MAP_W - CAM_X), VIEW_H / (MAP_H - CAM_Y));

function mapToScreen(mx: number, my: number) {
  return {
    x: (mx - CAM_X) * SCALE,
    y: (my - CAM_Y) * SCALE,
  };
}

// NPC office slot positions (in map pixel coords)
// 3 cols × 5 rows grid, starting at tile (161, 78)
function getSlotPositions() {
  const positions = [];
  const TILE = 32;
  const startCol = 161;
  const startRow = 78;
  const charW = 32;
  const charH = 64;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      const tileX = (startCol + c) * TILE + TILE / 2;
      const tileY = (startRow + r) * TILE;
      positions.push({
        x: tileX - charW / 2,
        y: tileY - charH,
        cx: tileX,
        cy: tileY - charH / 2,
      });
    }
  }
  return positions;
}

const SLOT_POSITIONS = getSlotPositions();

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  status: "online" | "busy" | "idle" | "offline";
  color: string;
}

// Frame animation: sprite sheet is 32×64 per frame, arranged horizontally
// 24 frames total → front-facing row starts at frame 18
const FRAME_W = 32;
const FRAME_H = 64;
const FRAMES_PER_ANIM = 6;
const FRONT_ROW_START = 18;

type AnimName = "idle" | "busy" | "thinking" | "offline";

const ANIM_CONFIG: Record<AnimName, { row: number; fps: number }> = {
  idle: { row: FRONT_ROW_START, fps: 8 },
  busy: { row: FRONT_ROW_START, fps: 6 },
  thinking: { row: FRONT_ROW_START, fps: 4 },
  offline: { row: FRONT_ROW_START, fps: 0 },
};

class ValleyRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImg: HTMLImageElement | null = null;
  private spriteImg: HTMLImageElement | null = null;
  private agents: (Agent | null)[] = [null, null, null, null, null];
  private animFrames: Map<string, number> = new Map(); // agentId → frame
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    // Load assets
    this.loadBg().catch(() => {});
    this.loadSprite("idle").catch(() => {});

    // Init frames
    for (let i = 0; i < 5; i++) {
      this.animFrames.set(`slot-${i}`, 0);
    }

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
  }

  private async loadBg(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { this.bgImg = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `${VALLEY_ASSETS}/Map1.png`;
    });
  }

  private async loadSprite(anim: AnimName): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { this.spriteImg = img; resolve(); };
      img.onerror = () => resolve();
      const file = anim === "busy" ? "Adam_phone_32x32.png" : "Adam_idle_anim_32x32.png";
      img.src = `${VALLEY_ASSETS}/${file}`;
    });
  }

  setAgent(slot: number, agent: Agent | null) {
    this.agents[slot] = agent;
    if (agent) {
      const file = agent.status === "busy" ? "Adam_phone_32x32.png" : "Adam_idle_anim_32x32.png";
      this.loadSprite(agent.status as AnimName).catch(() => {});
    }
  }

  private loop(time: number) {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.draw(dt);
    requestAnimationFrame((t) => this.loop(t));
  }

  private draw(_dt: number) {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    // Background
    if (this.bgImg) {
      ctx.save();
      ctx.translate(-CAM_X * SCALE, -CAM_Y * SCALE);
      ctx.scale(SCALE, SCALE);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(this.bgImg, 0, 0, MAP_W, MAP_H);
      ctx.restore();
    }

    // Camera border indicator
    ctx.strokeStyle = "rgba(0,212,170,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    // Characters
    for (let i = 0; i < Math.min(4, SLOT_POSITIONS.length); i++) {
      this.drawCharacter(i);
    }
  }

  private drawCharacter(slot: number) {
    const agent = this.agents[slot];
    const pos = SLOT_POSITIONS[slot];
    const screen = mapToScreen(pos.x, pos.y);
    const animName: AnimName = (agent?.status as AnimName) ?? "offline";
    const config = ANIM_CONFIG[animName];

    const frameKey = `slot-${slot}`;
    let frame = this.animFrames.get(frameKey) ?? 0;

    // Advance frame
    if (config.fps > 0) {
      const fps = config.fps;
      const framesInRow = FRAMES_PER_ANIM;
      frame = Math.floor(frame) % framesInRow;
      this.animFrames.set(frameKey, (frame + 1) % framesInRow);
    }

    const sx = (config.row + frame) * FRAME_W;
    const sy = 0;

    const dw = FRAME_W * SCALE;
    const dh = FRAME_H * SCALE;
    const dx = screen.x;
    const dy = screen.y;

    // Draw sprite
    if (this.spriteImg && agent) {
      this.ctx.drawImage(this.spriteImg, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh);
    } else if (agent) {
      // Placeholder: colored box
      this.ctx.fillStyle = agent.color + "88";
      this.ctx.fillRect(dx, dy, dw, dh);
      this.ctx.strokeStyle = agent.color;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(dx, dy, dw, dh);
    }

    // Name badge
    if (agent) {
      this.drawNameBadge(screen.x + dw / 2, dy, agent);
    }
  }

  private drawNameBadge(cx: number, y: number, agent: Agent) {
    const { ctx } = this;
    const name = agent.name || "Unknown";
    ctx.font = `bold ${Math.round(11 * SCALE)}px monospace`;
    const tw = ctx.measureText(name).width;
    const pad = 4 * SCALE;
    const dotR = 3 * SCALE;
    const bw = tw + pad * 2 + dotR * 2 + 2 * SCALE;
    const bh = Math.round(14 * SCALE);
    const bx = cx - bw / 2;
    const by = y - bh - 2 * SCALE;

    // Badge bg
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    this.roundRect(ctx, bx, by, bw, bh, 3 * SCALE);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 1.5 * SCALE;
    ctx.stroke();

    // Status dot
    const dotColor = { online: "#00ff88", busy: "#ff6b6b", idle: "#ffd93d", offline: "#555555" }[agent.status] ?? "#555";
    ctx.beginPath();
    ctx.arc(bx + pad + dotR, by + bh / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    // Name text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(name, bx + pad + dotR * 2 + 2 * SCALE, by + bh / 2);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  destroy() {
    // cleanup if needed
  }
}

export default function ValleyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ValleyRenderer | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Init renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    canvas.style.width = "100%";
    canvas.style.height = `${VIEW_H}px`;
    canvas.style.imageRendering = "pixelated";

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    rendererRef.current = new ValleyRenderer(canvas);

    // Fetch agents
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        const list: Agent[] = data.agents ?? [];
        setAgents(list);
        list.slice(0, 4).forEach((agent, i) => {
          rendererRef.current?.setAgent(i, agent);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Poll every 8s
    const interval = setInterval(() => {
      fetch("/api/agents")
        .then((r) => r.json())
        .then((data) => {
          const list: Agent[] = data.agents ?? [];
          setAgents(list);
          list.slice(0, 4).forEach((agent, i) => {
            rendererRef.current?.setAgent(i, agent);
          });
        })
        .catch(() => {});
    }, 8000);

    return () => {
      clearInterval(interval);
      rendererRef.current?.destroy();
    };
  }, []);

  const dotColor = (status: string) =>
    ({ online: "#00ff88", busy: "#ff6b6b", idle: "#ffd93d", offline: "#555555" }[status] ?? "#555");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            🗺️ Agent Valley
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""} · office area · {SCALE.toFixed(2)}× scale
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{
            padding: "5px 12px", borderRadius: "var(--radius-md)",
            background: "var(--surface)", border: "1px solid var(--border)",
            fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace"
          }}>
            Map: 5504×3072 · View: {VIEW_W}×{VIEW_H}
          </div>
        </div>
      </div>

      {/* Valley Canvas */}
      <div style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        position: "relative",
        background: "#0a0a14",
      }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "13px",
            background: "rgba(10,10,20,0.8)",
          }}>
            Loading valley...
          </div>
        )}
      </div>

      {/* Agent Grid */}
      {agents.length > 0 && (
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", fontFamily: "monospace" }}>
            AGENTS · {agents.length} total
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
            {agents.slice(0, 8).map((agent) => (
              <div key={agent.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 12px", borderRadius: "var(--radius-md)",
                background: "var(--surface)", border: "1px solid var(--border)",
                transition: "border-color 0.2s",
              }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: dotColor(agent.status), flexShrink: 0,
                  boxShadow: `0 0 6px ${dotColor(agent.status)}`,
                }} />
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                  {agent.emoji ? `${agent.emoji} ` : ""}{agent.name}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", display: "flex", gap: "16px" }}>
        <span>🎨 Map1 (5504×3072)</span>
        <span>🧍 Adam sprite</span>
        <span>📍 4 office slots</span>
        <span>🔄 8s polling</span>
      </div>
    </div>
  );
}
