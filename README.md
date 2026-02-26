# 📝 代码片段管理器

一个基于 Next.js + GitHub API 的自托管代码片段管理器，类似 GitHub Gist。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ 特性

- 🔐 **GitHub OAuth 登录** - 安全的用户认证
- 📝 **多文件代码片段** - 支持一个片段包含多个文件
- 🎨 **语法高亮** - 支持多种编程语言
- 🌙 **暗黑模式** - 自动/手动切换主题
- 🌍 **国际化** - 支持中英文切换
- 🔍 **全文搜索** - 基于 Pagefind 的代码片段搜索
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 📄 **Markdown 渲染** - Markdown 文件直接渲染预览
- 📦 **代码下载** - 支持下载单个文件或全部文件
- 🏷️ **标签系统** - 为代码片段添加标签分类
- 📜 **修订历史** - 查看代码片段的修改历史和版本对比

## 🚀 快速开始

### 环境要求

- Node.js 18+
- GitHub 账号
- GitHub OAuth App

### 1. 克隆项目

```bash
git clone https://github.com/yxksw/gist.git
cd gist
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填写以下配置：

```env
# GitHub OAuth App 配置
# 在 https://github.com/settings/developers 创建 OAuth App
GITHUB_CLIENT_ID=你的GitHub客户端ID
GITHUB_CLIENT_SECRET=你的GitHub客户端密钥

# NextAuth 配置
# 生成随机字符串: openssl rand -base64 32
NEXTAUTH_SECRET=你的NextAuth密钥
NEXTAUTH_URL=http://localhost:3000

# GitHub 仓库配置
# 用于存储代码片段的 GitHub 仓库
NEXT_PUBLIC_GITHUB_OWNER=你的GitHub用户名
NEXT_PUBLIC_GITHUB_REPO=你的仓库名
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_SNIPPETS_PATH=snippets

# GitHub Token (可选，用于提高 API 限制)
# 在 https://github.com/settings/tokens 创建
GITHUB_TOKEN=你的GitHub个人访问令牌

# 允许的用户 (可选，留空则允许所有登录用户)
ALLOWED_GITHUB_USERS=用户名1,用户名2
```

### 4. 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 代码片段管理器
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. 创建后获取 Client ID 和 Client Secret

### 5. 准备 GitHub 仓库

1. 在 GitHub 创建一个公开仓库（如 `code-gist`）
2. 在仓库中创建 `snippets` 文件夹
3. 代码片段将以子文件夹形式存储在该目录下

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📦 部署

### Vercel 部署（推荐）

1. **Fork 项目**
   - 在 GitHub 上 Fork 本项目

2. **导入到 Vercel**
   - 访问 https://vercel.com
   - 点击 "Add New Project"
   - 导入 Fork 的仓库

3. **配置环境变量**
   - 在 Vercel 项目设置中添加所有环境变量
   - `NEXTAUTH_URL` 设置为你的域名

4. **部署**
   - 点击 Deploy
   - 等待构建完成

5. **更新 OAuth App**
   - 回到 GitHub OAuth App 设置
   - 更新 Homepage URL 和 Authorization callback URL 为你的生产域名

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

构建并运行：

```bash
docker build -t gist-app .
docker run -p 3000:3000 --env-file .env.local gist-app
```

### 静态导出部署

```bash
npm run build
```

将 `out` 目录部署到任何静态托管服务（如 GitHub Pages、Cloudflare Pages）。

## 🛠️ 开发

### 项目结构

```
gist/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── snippet/      # 代码片段页面
│   │   │   └── [id]/
│   │   │       ├── revisions/     # 修订历史页面
│   │   │       │   ├── page.tsx
│   │   │       │   └── [sha]/
│   │   │       │       ├── page.tsx      # 版本对比
│   │   │       │       └── view/
│   │   │       │           └── page.tsx  # 查看历史版本
│   │   │       ├── edit/          # 编辑片段
│   │   │       └── page.tsx       # 片段详情
│   │   ├── new/          # 新建片段页面
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── components/       # React 组件
│   │   ├── header.tsx    # 顶部导航
│   │   ├── footer.tsx    # 底部组件
│   │   ├── snippet-card.tsx    # 片段卡片
│   │   ├── snippet-editor.tsx  # 片段编辑器
│   │   ├── snippet-files.tsx   # 文件展示
│   │   ├── search-modal.tsx    # 搜索弹窗
│   │   ├── pagination.tsx      # 分页组件
│   │   ├── code-block.tsx      # 代码块
│   │   ├── markdown-renderer.tsx  # Markdown 渲染
│   │   ├── copy-button.tsx     # 复制按钮
│   │   ├── theme-provider.tsx  # 主题提供者
│   │   ├── i18n-provider.tsx   # 国际化提供者
│   │   └── session-provider.tsx # 会话提供者
│   ├── lib/              # 工具库
│   │   ├── github.ts     # GitHub API 操作
│   │   ├── auth.ts       # 认证配置
│   │   ├── config.ts     # 应用配置
│   │   ├── i18n.ts       # 国际化配置
│   │   └── utils.ts      # 工具函数
│   └── types/            # TypeScript 类型
├── scripts/
│   └── build-search-index.js  # 搜索索引构建脚本
├── config.ts             # 站点配置
├── .env.example          # 环境变量示例
└── package.json
```

### 可用脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 添加新语言支持

1. 在 `src/lib/i18n.ts` 中添加翻译：

```typescript
export const translations = {
  en: { /* ... */ },
  zh: { /* ... */ },
  // 添加新语言
  ja: {
    siteName: 'コードスニペット',
    // ...
  }
}
```

2. 在 `config.ts` 中添加语言配置：

```typescript
export const siteConfig = {
  defaultLocale: 'zh' as const,
  locales: ['en', 'zh', 'ja'] as const,
  localeNames: {
    en: 'English',
    zh: '中文',
    ja: '日本語'
  }
}
```

### 自定义主题

编辑 `src/app/globals.css` 或 `tailwind.config.ts` 来自定义主题颜色。

## 🔧 配置说明

### 站点配置 (`config.ts`)

```typescript
export const siteConfig = {
  // 站点名称
  name: '代码片段管理器',
  // 页面标题
  title: '代码片段管理器 - 记录和分享代码',
  // 页面描述
  description: '一个自托管的代码片段管理工具',
  
  // Favicon 配置
  favicon: {
    type: 'emoji', // 'emoji' | 'svg' | 'url'
    value: '📝',   // Emoji 字符或 SVG 字符串或图片 URL
  },
  
  // 默认语言
  defaultLocale: 'zh',
  // 支持的语言
  locales: ['en', 'zh'],
}
```

### 代码片段存储结构

代码片段存储在 GitHub 仓库的 `snippets/` 目录下，每个片段是一个子文件夹：

```
snippets/
├── snippet-id-1/
│   ├── index.md          # 片段元数据（标题、描述、标签等）
│   ├── main.js           # 代码文件 1
│   └── utils.ts          # 代码文件 2
└── snippet-id-2/
    ├── index.md
    └── README.md
```

`index.md` 格式：

```yaml
---
title: 代码片段标题
description: 代码片段描述
createdAt: 2024-01-01T00:00:00.000Z
updatedAt: 2024-01-01T00:00:00.000Z
tags:
  - javascript
  - react
isPublic: true
files:
  - filename: main.js
    language: javascript
  - filename: utils.ts
    language: typescript
---
```

## 📝 使用指南

### 创建代码片段

1. 登录后点击 "新建片段"
2. 填写标题和描述
3. 添加代码文件（支持多文件）
4. 选择是否公开
5. 添加标签（可选）
6. 点击保存

### 搜索代码片段

- 点击顶部搜索框或按 `Cmd/Ctrl + K`
- 输入关键词搜索标题、描述和代码内容
- 点击结果跳转到对应片段

### 下载代码

- 单个文件：在文件卡片上点击复制按钮
- 全部文件：在片段详情页点击 "下载" 按钮

### 查看修订历史

- 在代码片段详情页点击 "修订历史" 按钮
- 查看所有修改记录，包括提交信息、作者、时间和变更统计
- 点击 "查看" 可浏览历史版本的代码
- 点击 "查看对比" 可查看与上一版本的差异（绿色为添加，红色为删除）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Pagefind](https://pagefind.app/) - 静态搜索
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API 客户端
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - 语法高亮

---

## Star History

## Star History

<a href="https://www.star-history.com/#yxksw/gist&type=date&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=yxksw/gist&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=yxksw/gist&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=yxksw/gist&type=date&legend=bottom-right" />
 </picture>
</a>

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！
