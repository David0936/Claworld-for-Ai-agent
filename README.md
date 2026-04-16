# Claworld Desktop

**AI Agent Visualization Dashboard** — See your AI agents working in a pixel-art office.

Powered by Next.js + TypeScript + SQLite. Runs locally on macOS.

---

## ✨ Features

- **Pixel Office** — Watch agents in a rendered pixel-art scene (3 character slots: sofa, desk, bed)
- **Sessions** — View and manage active AI agent sessions
- **Cron Jobs** — Schedule and monitor background tasks
- **Skills** — Browse available agent capabilities
- **Files** — Navigate workspace files
- **Memory** — Query agent long-term memory
- **Git** — Git status and operations
- **Settings** — Configure behavior, appearance, and integrations

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/David0936/Claworld-for-Ai-agent.git
cd Claworld-for-Ai-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Then edit .env.local with your setup

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── (dashboard)/   # Main dashboard routes
│   └── api/           # API endpoints
├── components/       # Reusable UI components
│   └── PixelOffice/   # Pixel art office renderer
├── lib/               # Utilities and database
└── hooks/             # Custom React hooks

office-assets/         # Pixel art assets (see Art Assets License below)
public/
├── office-assets/     # Rendered layers and sprites
└── ...
```

---

## 🎨 Art Assets License

**Art assets in this repository are NOT available for commercial use.**

- All visual assets under `office-assets/` and `public/office-assets/` are created by **怪怪** and are licensed for **personal/evaluation use only**.
- You may NOT use, remix, sell, or redistribute the art assets for commercial purposes.
- The software code (MIT License) and the art assets are licensed separately.

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

---

## 👤 Author

**David Yu** — [@David0936](https://github.com/David0936)

- GitHub: [github.com/David0936](https://github.com/David0936)
- WeChat: 824644809

---

## 🔗 Related

- [Claworld Shop](https://shop.claworld.ai) — AI数字资产商城
- [Claworld Openclaw Extension](https://github.com/David0936/claworld-openclaw) — OpenClaw integration
