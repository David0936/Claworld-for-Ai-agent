"use client";

import { useState } from "react";

// Debug viewer: renders ONE layer at a time so we can see what each file actually contains
const LAYERS = [
  ["room-bg", "room-bg.png"],
  ["墙左", "layer-墙左.png"],
  ["墙右", "layer-墙右.png"],
  ["床", "layer-床.png"],
  ["跑步机", "layer-跑步机.png"],
  ["卫生间", "layer-卫生间.png"],
  ["机柜", "layer-机柜.png"],
  ["显示状态的机器", "layer-显示状态的机器.png"],
  ["左边柜子", "layer-左边柜子.png"],
  ["电视", "layer-电视.png"],
  ["办公区", "layer-办公区.png"],
  ["微波炉", "layer-微波炉.png"],
  ["饮水机", "layer-饮水机.png"],
  ["取暖器", "layer-取暖器.png"],
  ["吉他", "layer-吉他.png"],
  ["沙发地毯", "layer-沙发地毯.png"],
  ["电脑椅子", "layer-电脑椅子.png"],
  ["龙虾角色", "layer-龙虾角色.png"],
  ["灯", "layer-灯.png"],
  ["小家标识", "layer-小家标识.png"],
  ["LOGO文字", "layer-LOGO文字.png"],
];

export default function PixelOfficeDebug() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div style={{ padding: 20, background: "#0a0a14", minHeight: "100vh" }}>
      <h2 style={{ color: "#fff", fontFamily: "monospace", marginBottom: 12 }}>
        Layer Debugger
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {LAYERS.map(([key, file]) => (
          <button
            key={key}
            onClick={() => setActive(active === key ? null : key)}
            style={{
              padding: "6px 12px",
              background: active === key ? "#FF385C" : "#1a1a2e",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {active === null ? (
        <p style={{ color: "#666", fontFamily: "monospace" }}>
          Click a layer name to preview it
        </p>
      ) : (
        <div>
          {LAYERS.filter(([k]) => k === active).map(([key, file]) => (
            <div key={key}>
              <p style={{ color: "#FF385C", fontFamily: "monospace", fontSize: 13 }}>
                Rendering: {key} → /office-assets/assets/{file}
              </p>
              <img
                src={`/office-assets/assets/${file}?t=${Date.now()}`}
                alt={key}
                style={{
                  maxWidth: 640,
                  maxHeight: 360,
                  imageRendering: "pixelated",
                  border: "2px solid #FF385C",
                  background: "#111",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("hidden");
                }}
              />
              <p hidden style={{ color: "#E74C3C", fontFamily: "monospace" }}>
                ❌ File not found
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
