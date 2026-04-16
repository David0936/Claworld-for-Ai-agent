🌐 Language: English | [中文](README.zh.md)

# 🏢 Claworld Desktop

**Local AI Agent Visualization Dashboard** — See your AI assistant working in real-time through a pixel-art office scene.

![Pixel Office](public/office-assets/assets/showcase-preview.webp)

Deeply integrated with [OpenClaw](https://github.com/openclaw/openclaw). Runs locally on macOS. Open the dashboard anytime to see what your AI is doing.

---

## ✨ Features

- 🖼️ **Pixel Office** — 3 character slots (Sofa / Desk / Bed), AI position and status rendered live
- 💻 **Sessions** — View and manage active AI agent sessions
- ⏰ **Cron** — Schedule and monitor background tasks
- 🧩 **Skills** — Browse installed agent capabilities
- 📁 **Files** — Navigate workspace files from the browser
- 🧠 **Memory** — Query long-term agent memory
- 🔁 **Git** — Git status and operations
- 📅 **Calendar** — Calendar and event management
- 💰 **Costs** — Usage and cost analysis
- ⚙️ **Settings** — Unified configuration panel
- 🏪 **Shop** — Direct link to Claworld Asset Store

---

## 🛠 Setup

**Requirements:** macOS, Node.js 18+

```bash
# Clone the repo
git clone https://github.com/David0936/Claworld-for-Ai-agent.git
cd Claworld-for-Ai-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your OpenClaw setup

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📐 Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + TypeScript |
| UI Style | Pixel art dark theme + Airbnb design system |
| Persistence | SQLite (Activity logs) |
| Art Assets | PNG/WebP layered sprites + localStorage asset registry |
| Agent Integration | OpenClaw REST API |

### Module Structure

```
src/
├── app/(dashboard)/          # Route pages
│   ├── page.tsx             # Dashboard home
│   ├── office/              # Pixel office
│   ├── sessions/            # Session management
│   ├── cron/                # Cron jobs
│   ├── skills/              # Skills browser
│   ├── files/               # File browser
│   ├── memory/              # Memory queries
│   ├── git/                 # Git operations
│   ├── calendar/            # Calendar
│   ├── costs/               # Cost analysis
│   ├── settings/           # Settings
│   └── shop/                # Store link
├── components/              # Shared components
│   └── PixelOffice/         # Pixel office renderer
├── hooks/                   # React hooks
│   ├── useAssetRegistry.ts  # Asset registry CRUD
│   └── useActiveAsset.ts    # Active asset state
└── lib/                     # Utilities
    ├── asset-registry.ts    # Registry operations
    ├── manifest-parser.ts   # manifest.json parser
    └── activities-db.ts     # SQLite activity log
```

### Pixel Office Rendering

```
room-bg.webp (1280x720)
  └── Static background (all furniture composited)
        └── [Character Slots 1-3]
              └── Character sprite (idle/busy/thinking/offline)
                    └── Name badge (Agent name + status dot)
```

- **3 Character Slots:** Sofa (idle), Desk (working), Bed (offline)
- **Assets** in `public/office-assets/` (room background, character sprites, coordinate data)
- **Asset Registry** manages install/activate/uninstall via localStorage

---

## 🎨 Art Assets

**Art assets are NOT covered by the MIT license and are separately licensed.**

All visual assets under `public/office-assets/` (backgrounds, character sprites, icons, etc.) were created by **怪怪** and are **prohibited from commercial use**. They are licensed for personal and evaluation use only.

For commercial licensing of art assets, please contact the author directly or replace them with your own original assets.

---

## 📄 License

### Software Code: MIT License

Copyright (c) 2026 **David Yu**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Art Assets: Non-Commercial Only

Art assets (`public/office-assets/`) created by **怪怪**. Commercial use is prohibited. See "Art Assets" section above for details.

---

## 👤 Author

**David Yu** — [GitHub](https://github.com/David0936)

- WeChat: 824644809

---

## 🔗 Related Projects

- [🏪 Claworld Shop](https://shop.claworld.ai) — AI Asset Store
- [🦞 OpenClaw](https://github.com/openclaw/openclaw) — Agent Runtime
- [🎨 claworld-lobster-king](https://github.com/David0936/claworld-lobster-king) — Pixel Art Asset Library
