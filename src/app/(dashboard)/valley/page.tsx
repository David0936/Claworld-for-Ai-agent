"use client";

import { useEffect, useRef, useState } from "react";

const LOBSTER_URL = "/office-assets/assets";

// Office scene: use the room background (1280x720)
const VIEW_W = 1280;
const VIEW_H = 720;

// Character slot positions in the office scene (canvas coordinates)
// These match the PSD layer-coords.json positions from claworld-lobster-king
const OFFICE_SLOTS = [
  // Slot 1: Sofa area (沙发出租)
  { id: "slot-1", cx: 548, cy: 479, label: "沙发", charH: 150, charW: 188 },
  // Slot 2: Office/desk area
  { id: "slot-2", cx: 245, cy: 212, label: "办公桌", charH: 150, charW: 188 },
  // Slot 3: Bed area
  { id: "slot-3", cx: 1074, cy: 509, label: "床", charH: 150, charW: 188 },
];

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  status: "online" | "busy" | "idle" | "offline";
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#00ff88",
  busy: "#ff6b6b",
  idle: "#ffd93d",
  offline: "#555555",
};

const STATUS_LABELS: Record<string, string> = {
  online: "在线",
  busy: "忙碌",
  idle: "空闲",
  offline: "离线",
};

// Status → position in office
function slotForStatus(status: string, index: number): number {
  if (status === "offline") return 2; // bed
  if (status === "busy") return 1;   // desk
  return 0;                            // sofa (idle/online)
}

class ValleyRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImg: HTMLImageElement | null = null;
  private lobsterImg: HTMLImageElement | null = null;
  private agents: (Agent | null)[] = [null, null, null];
  private time = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;

    // Load assets
    this.loadBg();
    this.loadLobster();

    requestAnimationFrame((t) => this.loop(t));
  }

  private async loadBg() {
    // Try room-bg first (1280x720), fallback to scene-bg
    const urls = ["/office-assets/assets/room-bg.png", "/office-assets/assets/scene-bg.webp", "/office-assets/assets/room-bg.webp"];
    for (const url of urls) {
      try {
        const img = await this.loadImage(url);
        if (img.width > 0) { this.bgImg = img; break; }
      } catch {}
    }
  }

  private async loadLobster(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { this.lobsterImg = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `${LOBSTER_URL}/char-lobster.png`;
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  setAgents(agentList: Agent[]) {
    // Map agents to slots based on their status
    this.agents = [null, null, null];
    for (const agent of agentList.slice(0, 3)) {
      const slotIdx = slotForStatus(agent.status, 0);
      if (!this.agents[slotIdx]) {
        this.agents[slotIdx] = agent;
      } else {
        // Slot taken, find first empty
        for (let i = 0; i < 3; i++) {
          if (!this.agents[i]) { this.agents[i] = agent; break; }
        }
      }
    }
  }

  private loop(time: number) {
    this.time = time;
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  private draw() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, W, H);
    }

    // Draw agents at their slots
    for (let i = 0; i < OFFICE_SLOTS.length; i++) {
      this.drawAgent(i);
    }
  }

  private drawAgent(slotIdx: number) {
    const slot = OFFICE_SLOTS[slotIdx];
    const agent = this.agents[slotIdx];
    const { ctx } = this;

    if (!agent) return;

    const { cx, cy, charW, charH } = slot;
    const status = agent.status;
    const color = STATUS_COLORS[status] ?? STATUS_COLORS.offline;

    // Pulse animation
    const pulse = status === "busy" ? Math.sin(this.time / 300) * 0.3 + 0.7 : 1;

    // Draw character
    if (this.lobsterImg) {
      // Bob up/down slightly for busy
      const bob = status === "busy" ? Math.sin(this.time / 400) * 3 : 0;
      const dw = charW;
      const dh = charH;
      const dx = cx - dw / 2;
      const dy = cy - dh + bob;

      ctx.save();
      // Glow for active agents
      if (status !== "offline") {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12 * pulse;
      }
      ctx.drawImage(this.lobsterImg, dx, dy, dw, dh);
      ctx.restore();
    } else {
      // Fallback placeholder
      ctx.fillStyle = color + "88";
      ctx.fillRect(cx - charW / 2, cy - charH, charW, charH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - charW / 2, cy - charH, charW, charH);
    }

    // Name badge
    this.drawBadge(cx, cy - charH - 20, agent, pulse);
  }

  private drawBadge(cx: number, y: number, agent: Agent, pulse: number) {
    const { ctx } = this;
    const name = agent.name;
    const status = agent.status;
    const color = STATUS_COLORS[status] ?? STATUS_COLORS.offline;

    ctx.font = "bold 12px monospace";
    const tw = ctx.measureText(name).width;
    const pad = 6;
    const dotR = 4;
    const bw = tw + pad * 2 + dotR * 2 + 4;
    const bh = 18;
    const bx = cx - bw / 2;
    const by = y;

    // Badge bg
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    this.roundRect(ctx, bx, by, bw, bh, 4);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = pulse;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Status dot (pulsing glow)
    ctx.beginPath();
    ctx.arc(bx + pad + dotR, by + bh / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    if (status !== "offline") {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 * pulse;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Name text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(name, bx + pad + dotR * 2 + 4, by + bh / 2);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
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

  destroy() {}
}

export default function ValleyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ValleyRenderer | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    canvas.style.width = "100%";
    canvas.style.height = `${VIEW_H}px`;
    canvas.style.imageRendering = "pixelated";

    rendererRef.current = new ValleyRenderer(canvas);

    // Detect available background
    const tryBg = async () => {
      for (const url of ["/office-assets/assets/room-bg.png", "/office-assets/assets/scene-bg.webp"]) {
        try {
          const r = await fetch(url, { method: "HEAD" });
          if (r.ok) { setBgUrl(url); break; }
        } catch {}
      }
    };
    tryBg();

    // Fetch agents
    const fetchAgents = async () => {
      try {
        const r = await fetch("/api/agents");
        const data = await r.json();
        const list: Agent[] = data.agents ?? [];
        setAgents(list);
        rendererRef.current?.setAgents(list);
      } catch {}
      setLoading(false);
    };
    fetchAgents();

    const interval = setInterval(async () => {
      try {
        const r = await fetch("/api/agents");
        const data = await r.json();
        const list: Agent[] = data.agents ?? [];
        setAgents(list);
        rendererRef.current?.setAgents(list);
      } catch {}
    }, 8000);

    return () => {
      clearInterval(interval);
      rendererRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            🦞 Pixel Office
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""} · {bgUrl ? "room-bg" : "scene"} · Canvas 2D
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{STATUS_LABELS[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Office Canvas */}
      <div style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        position: "relative",
        background: "#0a0a14",
      }}>
        <canvas ref={canvasRef} />
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "13px",
            background: "rgba(10,10,20,0.8)",
          }}>
            Loading office...
          </div>
        )}
      </div>

      {/* Agent Slots Legend */}
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", fontFamily: "monospace" }}>
          AGENT SLOTS · {agents.length}/3 occupied
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
          {OFFICE_SLOTS.map((slot, i) => {
            const agent = agents.find(a => {
              const si = slotForStatus(a.status, 0);
              return si === i;
            });
            const color = agent ? STATUS_COLORS[agent.status] : "#333";
            return (
              <div key={slot.id} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: "var(--surface)", border: `1px solid ${agent ? color + "66" : "var(--border)"}`,
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: color + "33",
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px",
                }}>
                  🦞
                </div>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {slot.label}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: agent ? color : "var(--text-muted)" }}>
                    {agent ? `${agent.name} · ${STATUS_LABELS[agent.status]}` : "空"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Agents */}
      {agents.length > 0 && (
        <div className="card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontFamily: "monospace" }}>
            ALL AGENTS · {agents.length}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {agents.map((agent) => {
              const color = STATUS_COLORS[agent.status];
              return (
                <div key={agent.id} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "999px",
                  background: "var(--surface)", border: `1px solid ${color}44`,
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)" }}>
                    {agent.emoji ? `${agent.emoji} ` : ""}{agent.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace", display: "flex", gap: "16px" }}>
        <span>🦞 char-lobster (188×150)</span>
        <span>🛋 sofa · 💻 desk · 🛏 bed</span>
        <span>🔄 8s polling</span>
      </div>
    </div>
  );
}
