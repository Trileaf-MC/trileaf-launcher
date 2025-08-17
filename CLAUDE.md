# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Trileaf Launcher** (三叶启动器), a customized launcher based on the Modrinth APP that adds comprehensive multiplayer functionality and a multiplayer platform ecosystem. The project is a fork of Modrinth's launcher with additional features for online server browsing and one-click joining.

## Architecture

This is a **Tauri-based** desktop application with a **monorepo structure**:

### Core Applications
- **apps/app**: Tauri desktop application (Rust backend)
- **apps/app-frontend**: Vue 3 frontend with TypeScript 
- **apps/labrinth**: Modrinth API server (Rust)
- **apps/daedalus_client**: Minecraft client management (Rust)

### Key Technologies
- **Frontend**: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia (state management)
- **Backend**: Rust, Tauri 2.x, Actix Web, SQLx (PostgreSQL)
- **Build System**: Turbo (monorepo), pnpm (package manager)

### Frontend Structure
- **Pages**: `apps/app-frontend/src/pages/` - Main application views
  - `online/Lobby.vue` - Multiplayer server lobby (key feature)
  - `Browse.vue`, `Index.vue`, `Skins.vue`, `Worlds.vue`
- **Components**: `apps/app-frontend/src/components/ui/` - Reusable UI components
- **API Layer**: `apps/app/src/api/` - Rust API endpoints for Tauri commands
- **State Management**: `apps/app-frontend/src/store/` - Pinia stores

### Backend API Structure
Key Rust modules in `apps/app/src/api/`:
- `profile.rs` - User profiles and instances
- `process.rs` - Game process management  
- `auth.rs` - Authentication (Modrinth, Microsoft)
- `worlds.rs` - World/server management
- `friends.rs` - Friends system

## Development Commands

### Root Level Commands
```bash
# Build all packages
pnpm build

# Run linting across all packages  
pnpm lint

# Run tests across all packages
pnpm test

# Fix linting issues across all packages
pnpm fix

# Run CI checks (lint + test)
pnpm ci
```

### App Development
```bash
# Start app in development mode
pnpm app:dev
# or
turbo run dev --filter=@modrinth/app

# Build app for production
pnpm app:build

# Fix app code (Rust clippy + fmt)
pnpm app:fix
```

### Testing
```bash
# Run app tests (uses cargo nextest)
turbo run test --filter=@modrinth/app

# Type checking for frontend
turbo run tsc:check --filter=@modrinth/app-frontend
```

## Custom Features (Trileaf-specific)

### Multiplayer Lobby System
The key differentiator is the **online multiplayer lobby** functionality:

- **API Integration**: Connects to "三叶互联后端" (Trileaf interconnect backend) at `sanyeyun.cn`
- **Server Discovery**: Fetches server list from backend, displays in lobby interface
- **One-click Join**: Automatically creates game instances with required mods/versions for target servers
- **Cloud Control Mod Integration**: Receives server info from "三叶云控" server-side mod

### API Endpoints (from .cursor/rules/api-docs.mdc)
- **Server Query**: [Query multiplayer lobby](https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310408242.md)
- **Mod Association**: [Query associated mods by server info](https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915.md)

## Important Notes

### Development Environment
- Uses **pnpm** as package manager (required for workspace dependencies)
- **Turbo** for monorepo task coordination
- **Rust 2024 edition** with workspace configuration
- Frontend uses **Vue 3 Composition API** with TypeScript

### Code Style
- **Rust**: Uses clippy lints defined in `Cargo.toml`, formatted with rustfmt
- **Frontend**: ESLint + Prettier with Nuxt config, semi: false, singleQuote: true
- **Commits**: Follow conventional commits for automated changelog generation

### Database
- **PostgreSQL** with SQLx for compile-time checked queries
- Migrations in `apps/labrinth/migrations/`
- Uses `SQLX_OFFLINE=true` for offline builds

## File Structure Focus Areas

When working on multiplayer features, focus on:
- `apps/app-frontend/src/pages/online/` - Multiplayer lobby UI
- `apps/app/src/api/friends.rs` - Friends system backend  
- `apps/app-frontend/src/helpers/friends.js` - Friends frontend logic
- `apps/app-frontend/src/components/ui/friends/` - Friends UI components

For general launcher functionality:
- `apps/app-frontend/src/pages/instance/` - Instance management
- `apps/app/src/api/profile.rs` - Profile and instance backend
- `apps/app/src/api/process.rs` - Game launching logic
- 我正在二改 modrinth app ，目的是强化它的联机和多人交互功能，更改后的产品名称为 `trileaf launcher`。  
我想在启动器里实现“联机大厅”的功能，也就是维护一个 Minecraft 服务器房间列表，用户可以  
1. 方便的查看当前有哪些可加入的服务器房间，房间应该做出适当的分类，比如 **生电服**，**休闲服** 或者基于特定整合包的服，我会搭建一个 **三叶互联** 网站后台，服务器的信息可以从那里获取，接口文档可见 [查询联机大厅](https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310408242.md)。服务器房间卡片上可以显示服务器标题、在线人数、ping 的延迟等等 
2. 点击某个服务器房间卡片，进入详情页，里面能查看当前服务器的详情信息，比如在线的玩家 ID 和 MC 皮肤头像，服务器具体使用了哪些模组  

重要：由于这是个 monorepo，你只需要关注桌面端应用的开发，无需关注网页的开发。  

## PostHog CORS 报错与解决方案（开发环境）

### 现象
- 开发模式下（`http://localhost:1420`）定期出现：
  - “Access-Control-Allow-Origin 不能为 *，当请求 credentials=include 时……”
  - 来源：`https://posthog.modrinth.com/e/…`（`posthog-js@1.158.2` 重试队列日志）

### 原因
- `posthog-js` 在某些情况下会使用携带凭据的请求（XHR withCredentials / fetch credentials）。
- 目标服务返回 `Access-Control-Allow-Origin: *`，与“带凭据请求”不兼容，浏览器 CORS 拒绝。
- 该问题通常只影响“浏览器开发环境跨域”，Tauri 生产环境一般不会从 `http://localhost` 发起跨域。

### 定位
- 初始化位置：`apps/app-frontend/src/helpers/analytics.js`
  - 当前配置：
    - `api_host: 'https://posthog.modrinth.com'`
    - `persistence: 'localStorage'`

### 解决方案（可选）

1) 仅在生产环境启用统计（推荐，最简单稳定）
- 思路：开发环境不初始化 PostHog，并让导出的埋点方法在禁用时为 no-op。
- 修改 `apps/app-frontend/src/helpers/analytics.js`：
```js
import { posthog } from 'posthog-js'

const analyticsEnabled = import.meta.env.PROD && !import.meta.env.VITE_DISABLE_ANALYTICS

export const initAnalytics = () => {
  if (!analyticsEnabled) return
  posthog.init('phc_…你的key…', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://posthog.modrinth.com',
    persistence: 'localStorage',
    disable_session_recording: true,
  })
}

export const trackEvent = (name, props) => {
  if (!analyticsEnabled) return
  posthog.capture(name, props)
}

export const optOutAnalytics = () => {
  if (!analyticsEnabled) return
  posthog.opt_out_capturing()
}
```
- 可选：在 `.env.development` 写入 `VITE_DISABLE_ANALYTICS=true`。

优点：实现最小；彻底消除开发期 CORS 噪音。缺点：本地调试不到统计。

2) Vite 代理同源化（开发环境保留统计）
- 思路：将 `https://posthog.modrinth.com` 通过 Vite dev server 代理为同源路径，规避浏览器跨域校验。
- 新增 `apps/app-frontend/vite.config.ts`：
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/posthog': {
        target: 'https://posthog.modrinth.com',
        changeOrigin: true,
        // 可选：不转发本地 cookie
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie')
          })
        },
      },
    },
  },
})
```
- 同时调整初始化：
```js
const apiHost = import.meta.env.PROD ? 'https://posthog.modrinth.com' : '/posthog'
posthog.init('phc_…', { api_host: apiHost, persistence: 'localStorage' })
```

优点：保留本地统计与调试；对代码影响小。缺点：需要维护 dev 代理配置。

3) 尝试关闭凭据/持久化以避免 withCredentials（需验证）
- 思路：减少/禁用 cookie 与跨站凭据，迫使请求不带凭据。
- 可能的配置（不同版本兼容性需实际验证）：
```js
posthog.init('phc_…', {
  api_host: 'https://posthog.modrinth.com',
  disable_cookie: true,
  disable_persistence: true,
  // 若库支持自定义 fetch，可显式移除凭据：
  // fetch: (url, options) => fetch(url, { ...options, credentials: 'omit' })
})
```

优点：不改代理/环境切换。缺点：不同版本行为差异较大，需联调确认；可能影响识别能力。

4) 通过 Tauri 侧转发（不推荐，复杂）
- 思路：用 Tauri HTTP 客户端/后端命令代理上报，浏览器不直接跨域。
- 缺点：增加后端接口与安全面；超出“前端配置即可解决”的范围。

### 建议
- 首选方案 1（仅生产启用），稳妥快速，避免干扰本地开发。
- 若确需本地调试统计，选方案 2（Vite 代理）。
- 方案 3 作为备选，需要我们在当前 `posthog-js@1.158.2` 上验证行为。

如果你选定方案，请告诉我编号，我会据此提交相应的编辑。
