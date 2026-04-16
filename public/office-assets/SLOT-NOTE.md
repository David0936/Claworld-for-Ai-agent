# Office Scene Structure — Slot Architecture

## Asset Overview

| File | Resolution | Description |
|------|-----------|-------------|
| `scene-bg-master.png` | 3600x2025 | Master background (no character) |
| `scene-full-master.png` | 3600x2025 | Master full scene (with lobster) |
| `room-bg.png` | 1280x720 | Display background (no character) |
| `scene-bg.webp` | 1280x720 | WebP background (q95) |
| `scene-full.webp` | 1280x720 | WebP full scene (q95) |
| `layer-龙虾角色.png/.webp` | 188x150 | Lobster character (trimmed, positioned) |
| `char-lobster.png/.webp` | 188x150 | Character sprite (copy) |
| `layer-coords.json` | — | All layer coordinates (1280x720 canvas) |

## Rendering Architecture

```
1. room-bg.png          ← clean background, all static elements baked in
2. Character slot sprite ← drawn at slot position from layer-coords.json
3. Name badge overlay    ← agent name + status dot
```

**No individual furniture layers are drawn on top of room-bg** — they are already composited into the background. This prevents double-rendering artifacts.

## 3 Character Slots

### Slot 1: Sofa (沙发)

- **Position**: center=(606, 415), size=188x150
- **Current sprite**: `layer-龙虾角色.png`
- **Z-order**: drawn after room-bg, no foreground occlusion
- **Anchor**: character sits centered on the sofa
- **Reference layers**: `沙发地毯` (sofa area) at center=(548, 479) size=420x283

### Slot 2: Office (办公区)

- **Position**: TBD (approximately center=(245, 200))
- **Future sprite**: `char-lobster-office.png`
- **Z-order**: drawn after room-bg, `电脑椅子` may need foreground overlay
- **Anchor**: character sits at the computer desk
- **Reference layers**: `办公区` at center=(245, 212) size=436x318
- **Occlusion note**: `电脑椅子` (center=241, 188) may partially overlap — if needed, split into separate foreground layer drawn after character

### Slot 3: Bed (床)

- **Position**: TBD (approximately center=(1074, 480))
- **Future sprite**: `char-lobster-bed.png`
- **Z-order**: drawn after room-bg, no foreground occlusion
- **Anchor**: character lies on the bed
- **Reference layers**: `床` at center=(1074, 509) size=307x223

## Per-Slot Sprite Replacement

Each slot maps agent status → sprite file:

```typescript
sprites: {
  idle:     "char-lobster-sofa-idle.png",
  busy:     "char-lobster-sofa-busy.png",
  thinking: "char-lobster-sofa-thinking.png",
  offline:  "char-lobster-sofa-offline.png",
}
```

To add a new state:
1. Create the sprite PNG (trimmed, transparent background)
2. Add coordinates to `layer-coords.json` (or reuse existing slot position)
3. Add the filename to the slot's `sprites` map in `PixelOffice.tsx`

## PSD Layer Classification

### Pure Background (baked into room-bg.png)

| Layer | Description |
|-------|-------------|
| 背景 | Black background |
| 图层 78 | Room shape mask |
| 组 10 | Floor + walls + room base structure |
| 办公区 | Office desk area |
| 电脑椅子 | Computer chair |
| 沙发地毯 | Sofa + carpet + lamp stand |
| 微波炉 | Microwave |
| 露营椅子 | Camping chair |
| 电视 | TV area |
| 墙左 | Left wall |
| 左边柜子 | Left cabinet + bonsai |
| 饮水机 | Water cooler + teapot |
| 显示状态的机器 | Status display machine |
| 机柜 | Server cabinet |
| 取暖器 | Heater |
| LOGO文字 | CLAWORLD text |
| 吉他 | Guitar |
| 卫生间 | Bathroom |
| 墙右 | Right wall |
| 灯 | Lamp |
| 床 | Bed |
| 跑步机 | Treadmill |
| 小家标识 | Logo sign |

### Character Layers (slot-replaceable)

| Layer | Slot | Current State |
|-------|------|---------------|
| 龙虾角色 | Slot 1 (sofa) | idle — lobster sitting on sofa eating popcorn |
| (future) | Slot 2 (office) | idle — lobster at computer desk |
| (future) | Slot 3 (bed) | idle — lobster lying in bed |

### Potential Foreground Occlusion Layers

When a character is at the office desk, the chair may need to be drawn IN FRONT of the character. To handle this:

1. Export `电脑椅子` as a separate foreground layer (already available as `layer-电脑椅子.png`)
2. Draw order: room-bg → character → 电脑椅子 foreground
3. This split is only needed when Slot 2 (office) is active

## Coordinate System

All coordinates are in **1280x720 canvas space**.

```
canvas_center: [cx, cy]  — center of the trimmed sprite
canvas_size:   [w, h]    — size of the trimmed sprite image

Draw position: (cx - w/2, cy - h/2)
```

PSD master is 3600x2025. Scale factor: 1280/3600 = 0.3556.
