🌐 Language: [English](README.md) | 中文

# 🏢 Claworld Desktop

**本地 AI Agent 状态看板** — 用像素风办公室看板实时可视化你的 AI 助手在做什么。

![Pixel Office](public/office-assets/assets/showcase-preview.webp)

与 [OpenClaw](https://github.com/openclaw/openclaw) 深度集成，在本地 macOS 上运行，随时打开就能看到 AI 的工作状态。

---

## ✨ 功能一览

- 🖼️ **像素办公室** — 3 个角色槽位（沙发 / 办公桌 / 床），AI 在哪、做什么，实时渲染
- 💻 **Sessions** — 查看和管理 AI 会话
- ⏰ **Cron** — 定时任务管理
- 🧩 **Skills** — 浏览已安装的 Agent 技能
- 📁 **Files** — 浏览器端文件系统
- 🧠 **Memory** — 查询长期记忆
- 🔁 **Git** — Git 状态与操作
- 📅 **Calendar** — 日历与日程
- 💰 **Costs** — 用量与成本分析
- ⚙️ **Settings** — 配置项一站式管理
- 🏪 **Shop** — 直达 Claworld 商城

---

## 🛠 安装

**环境要求：** macOS，Node.js 18+

```bash
# 克隆仓库
git clone https://github.com/David0936/Claworld-for-Ai-agent.git
cd Claworld-for-Ai-agent

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 OpenClaw 配置

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

---

## 📐 架构说明

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 + TypeScript |
| UI 风格 | 像素风深色主题 + Airbnb 设计系统 |
| 数据持久化 | SQLite（Activity 日志） |
| 美术资源 | PNG/WebP 分层素材 + localStorage 资产注册表 |
| Agent 集成 | OpenClaw REST API |

### 核心模块

```
src/
├── app/(dashboard)/          # 路由页面
│   ├── page.tsx             # 首页仪表盘
│   ├── office/              # 像素办公室
│   ├── sessions/            # 会话管理
│   ├── cron/                # 定时任务
│   ├── skills/              # 技能浏览器
│   ├── files/               # 文件管理
│   ├── memory/              # 记忆查询
│   ├── git/                 # Git 操作
│   ├── calendar/            # 日历
│   ├── costs/               # 成本分析
│   ├── settings/           # 设置
│   └── shop/                # 商城入口
├── components/              # 公共组件
│   └── PixelOffice/         # 像素办公室渲染器
├── hooks/                   # React Hooks
│   ├── useAssetRegistry.ts  # 资产注册表 CRUD
│   └── useActiveAsset.ts    # 当前激活资产
└── lib/                     # 工具函数
    ├── asset-registry.ts    # 资产注册表操作
    ├── manifest-parser.ts   # manifest.json 解析
    └── activities-db.ts     # SQLite 活动日志
```

### 像素办公室渲染原理

```
room-bg.webp (1280x720)
  └── 静态背景（所有家具已合成）
        └── [角色槽位 1-3]
              └── 角色精灵图（按状态切换 idle/busy/thinking/offline）
                    └── 名称角标（Agent 名 + 状态点）
```

- **3 个角色槽位：** 沙发（休息）、办公桌（工作）、床（离线）
- **美术素材** 在 `public/office-assets/`（含 room-bg、角色精灵、坐标数据）
- **资产注册表** 用 localStorage 管理，支持安装/激活/卸载资产包

---

## 🎨 美术资产

**美术资产不在 MIT 许可证范围内，单独授权。**

`public/office-assets/` 下的所有视觉素材（背景图、角色精灵、图标等）由 **怪怪** 创作，**禁止商用**，仅限个人学习或评估使用。

如需商用美术资产，请联系作者获取授权，或替换为你自己的原创素材。

---

## 📄 许可证

### 软件代码：MIT License

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

### 美术资产：禁止商用

美术资产（`public/office-assets/`）由 **怪怪** 创作，**非商业用途**。详情见上方「美术资产」说明。

---

## 👤 作者

**David Yu** — [GitHub](https://github.com/David0936)

- 微信：824644809

---

## 🔗 相关项目

- [🏪 Claworld Shop](https://shop.claworld.ai) — AI 数字资产商城
- [🦞 OpenClaw](https://github.com/openclaw/openclaw) — Agent 运行时
- [🎨 claworld-lobster-king](https://github.com/David0936/claworld-lobster-king) — 像素美术资产库
