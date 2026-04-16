# /export-psd-assets — PSD Asset Export & Office Scene Pipeline

## When to use
When the user wants to export layers from a PSD file for the Pixel Office scene, update layer coordinates, re-export specific layers, or rebuild the office assets.

## Context

The Pixel Office scene at `/office` uses a **slot-based rendering architecture**:
- `room-bg.png` — pre-composited background (all static elements, NO characters)
- Character sprites drawn on top at slot positions from `layer-coords.json`
- Name badge overlays

### File locations
- **PSD source**: `office-assets/基础模版 拷贝.psd` (3600x2025, 29 top-level layers)
- **Export scripts**:
  - `office-assets/export-psd-layers.py` — Python script using psd-tools + Pillow
  - `office-assets/ps-export-all.jsx` — Photoshop ExtendScript (better for layer effects)
- **Output**: `public/office-assets/assets/` (git submodule → claworld-lobster-king repo)
- **Coords**: `public/office-assets/assets/layer-coords.json`
- **Slot docs**: `public/office-assets/SLOT-NOTE.md`
- **Component**: `src/components/PixelOffice.tsx`

### Coordinate system
All coordinates are in **1280x720 canvas space**:
```json
{
  "layer_name": {
    "psd_bbox": [x1, y1, x2, y2],
    "canvas_center": [cx, cy],
    "canvas_size": [w, h]
  }
}
```
Draw position: `(cx - w/2, cy - h/2)`
PSD→canvas scale: `1280/3600 = 0.3556`

### 3 Character Slots
1. **Sofa (沙发)** — coordsKey: `龙虾角色`, center=(606,415), size=188x150
2. **Office (办公区)** — coordsKey: `龙虾角色-office`, TBD
3. **Bed (床)** — coordsKey: `龙虾角色-bed`, TBD

### Layer effects limitation
**psd-tools (Python) cannot fully render PSD layer effects** like outer glow, drop shadow, color overlay, etc. Layers with effects (e.g., 饮水机, 取暖器) will export as incomplete/wrong images.

For layers with effects, use one of these approaches:
1. **Photoshop JSX script** (`ps-export-all.jsx`) — renders effects natively
2. **Manual export** from Photoshop — right-click layer → Export As → PNG
3. **Python with `layer.composite(force=True)`** — may work for simple effects

## Instructions

### Full re-export from PSD (Python)
```bash
cd office-assets
python export-psd-layers.py "基础模版 拷贝.psd"
```
This produces:
- `assets/room-bg.png` — background without characters
- `assets/layer-*.png` — individual layers
- `assets/char-*.png` — character sprites

**After export**, you MUST:
1. Resize all outputs from 3600x2025 to 1280x720
2. Generate trimmed sprites with correct canvas_center/canvas_size coords
3. Convert to WebP (q95) for display versions
4. Update `layer-coords.json` with the new coordinates

### Photoshop JSX export (better quality)
User runs in Photoshop: File → Scripts → Browse → `ps-export-all.jsx`
- Exports at 1280x720 with trim
- Generates coords with bounds detection
- Handles layer effects correctly

### Update coordinates for a single layer
If the user provides a manually exported layer PNG:
1. Read the PNG dimensions
2. Calculate canvas_center and canvas_size from the PSD bbox
3. Update `layer-coords.json`
4. Verify rendering in the browser

### Adding a new character state
1. Create the sprite PNG (trimmed, transparent background)
2. Add coordinates to `layer-coords.json`
3. Add filename to the slot's `sprites` map in `PixelOffice.tsx`

### Post-export checklist
- [ ] All layer PNGs exist in `public/office-assets/assets/`
- [ ] `layer-coords.json` has entries for all layers
- [ ] `room-bg.png` is 1280x720, no character baked in
- [ ] Character sprite renders at correct sofa position
- [ ] No double-rendering artifacts (individual layers NOT drawn on top of room-bg)
- [ ] WebP versions generated for display assets
