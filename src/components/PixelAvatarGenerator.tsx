"use client";

import { useRef, useState } from "react";
import { Upload, RefreshCw, Download } from "lucide-react";

interface PixelAvatarGeneratorProps {
  onGenerated?: (base64: string) => void;
  size?: number;
  initialAvatar?: string;
}

function pixelateImage(
  img: HTMLImageElement,
  targetSize: number,
  pixelSize: number
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Draw original scaled down to targetSize
  canvas.width = targetSize;
  canvas.height = targetSize;
  ctx.drawImage(img, 0, 0, targetSize, targetSize);

  // Get pixelated version
  const pixelCanvas = document.createElement("canvas");
  const pixelCtx = pixelCanvas.getContext("2d")!;
  pixelCanvas.width = Math.floor(targetSize / pixelSize);
  pixelCanvas.height = Math.floor(targetSize / pixelSize);

  const src = ctx.getImageData(0, 0, targetSize, targetSize);
  const srcData = src.data;

  for (let y = 0; y < pixelCanvas.height; y++) {
    for (let x = 0; x < pixelCanvas.width; x++) {
      // Sample center of pixel block
      const px = Math.min(Math.floor(x * pixelSize + pixelSize / 2), targetSize - 1);
      const py = Math.min(Math.floor(y * pixelSize + pixelSize / 2), targetSize - 1);
      const i = (py * targetSize + px) * 4;
      const r = srcData[i];
      const g = srcData[i + 1];
      const b = srcData[i + 2];
      const a = srcData[i + 3];

      pixelCtx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      pixelCtx.fillRect(x, y, 1, 1);
    }
  }

  // Scale back up with pixelated rendering
  const output = document.createElement("canvas");
  const outCtx = output.getContext("2d")!;
  output.width = targetSize;
  output.height = targetSize;
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(pixelCanvas, 0, 0, targetSize, targetSize);

  return output.toDataURL("image/png");
}

function addPixelBorder(canvas: HTMLCanvasElement, borderColor = "#ffffff"): HTMLCanvasElement {
  const out = document.createElement("canvas");
  const ctx = out.getContext("2d")!;
  out.width = canvas.width + 4;
  out.height = canvas.height + 4;
  ctx.imageSmoothingEnabled = false;

  // Fill with border color
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, out.width, out.height);

  // Draw pixelated image
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 2, 2);
  return out;
}

export function PixelAvatarGenerator({ onGenerated, size = 64, initialAvatar }: PixelAvatarGeneratorProps) {
  const [preview, setPreview] = useState<string | null>(initialAvatar || null);
  const [pixelSize, setPixelSize] = useState(4);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const pixelated = pixelateImage(img, size, pixelSize);
        const withBorder = addPixelBorder(
          (() => {
            const c = document.createElement("canvas");
            c.width = size;
            c.height = size;
            c.getContext("2d")!.drawImage(
              (() => {
                const src = document.createElement("canvas");
                src.width = size;
                src.height = size;
                const sctx = src.getContext("2d")!;
                sctx.drawImage(img, 0, 0, size, size);
                return src;
              })(),
              0, 0
            );
            return c;
          })(),
          "#ffffff"
        );
        const final = withBorder.toDataURL("image/png");
        setPreview(final);
        onGenerated?.(final);
        setUploading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          textAlign: "center",
          cursor: "pointer",
          background: "var(--surface)",
          transition: "all 0.2s",
          marginBottom: "12px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--accent-soft)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {uploading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            <RefreshCw size={20} style={{ marginBottom: "4px" }} />
            <div>Generating...</div>
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            <Upload size={20} style={{ marginBottom: "4px" }} />
            <div>Drop a photo or click to upload</div>
            <div style={{ fontSize: "11px", marginTop: "4px" }}>
              Creates pixel art avatar from your photo
            </div>
          </div>
        )}
      </div>

      {/* Pixel size control */}
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Pixel size:
          </span>
          <input
            type="range"
            min={2}
            max={12}
            value={pixelSize}
            onChange={(e) => {
              setPixelSize(parseInt(e.target.value));
              // Re-process with new size
              if (fileRef.current?.files?.[0]) {
                processFile(fileRef.current.files[0]);
              }
            }}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", minWidth: "20px" }}>{pixelSize}px</span>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={preview}
            alt="Pixel avatar preview"
            style={{
              width: `${size * 3}px`,
              height: `${size * 3}px`,
              imageRendering: "pixelated",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          />
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>
              Pixel Avatar Generated!
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {pixelSize}px pixel blocks · {size}x{size}px
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
