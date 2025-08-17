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

### Frontend Development
```bash
# Start web frontend development server
pnpm web:dev

# Build web frontend
pnpm web:build

# Fix frontend code (ESLint + Prettier)
pnpm web:fix
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
