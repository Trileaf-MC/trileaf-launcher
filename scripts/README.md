# SQLx 查询缓存生成脚本

## 问题描述

当项目配置了 `SQLX_OFFLINE = "true"` 但缺少查询缓存文件时，会出现以下编译错误：

```
error: `SQLX_OFFLINE=true` but there is no cached data for this query, 
run `cargo sqlx prepare` to update the query cache
```

## 解决方案

### 1. 使用自动化脚本（推荐）

**Linux/macOS/WSL:**
```bash
# 为 app-lib 生成查询缓存（SQLite）
./scripts/generate-sqlx-cache.sh

# 为 labrinth 生成查询缓存（PostgreSQL）
# 首先设置数据库 URL
export DATABASE_URL="postgres://user:password@localhost/labrinth"
./scripts/generate-sqlx-cache.sh apps/labrinth
```

**Windows:**
```cmd
# 为 app-lib 生成查询缓存（SQLite）
scripts\generate-sqlx-cache.bat

# 为 labrinth 生成查询缓存（PostgreSQL）
# 首先设置数据库 URL
set DATABASE_URL=postgres://user:password@localhost/labrinth
scripts\generate-sqlx-cache.bat apps\labrinth
```

### 2. 使用 Makefile

```bash
# 为 app-lib 生成查询缓存
make sqlx-prepare

# 为 labrinth 生成查询缓存
make sqlx-prepare-labrinth

# 检查查询缓存是否最新
make sqlx-check

# 显示帮助
make help
```

### 3. 手动操作

如果你想手动操作，请按以下步骤：

1. **进入对应的包目录**：
   ```bash
   cd packages/app-lib  # 或 cd apps/labrinth
   ```

2. **临时禁用离线模式**：
   编辑 `.cargo/config.toml`，将 `SQLX_OFFLINE = "true"` 注释掉

3. **生成查询缓存**：
   ```bash
   export DATABASE_URL="sqlite:$(pwd)/temp.db"
   cargo install sqlx-cli --no-default-features --features sqlite
   sqlx database create
   sqlx migrate run
   cargo sqlx prepare
   ```

4. **重新启用离线模式**：
   编辑 `.cargo/config.toml`，取消注释 `SQLX_OFFLINE = "true"`

5. **清理临时文件**：
   ```bash
   rm -f temp.db temp.db-shm temp.db-wal
   ```

## 关于 .sqlx 目录

### 是否应该提交到 Git？

这取决于具体的使用场景：

**应该提交的情况：**
- 生产环境需要离线编译（如 Docker 构建）
- CI/CD 环境没有数据库连接
- 团队需要确保构建一致性

**不应该提交的情况：**
- 开发环境总是有数据库连接
- 查询经常变化，缓存更新频繁
- 团队更倾向于在线验证查询

### 当前项目配置

本项目的配置如下：
- `packages/app-lib/.sqlx` - 被 `.gitignore` 忽略（开发时使用在线模式）
- `apps/labrinth/.sqlx` - 应该被提交（Docker 构建需要）

**注意：** `apps/labrinth` 使用 PostgreSQL，需要先设置 `DATABASE_URL` 环境变量才能生成查询缓存。

## 最佳实践

1. **开发环境**：可以使用在线模式，设置 `DATABASE_URL` 环境变量
2. **生产环境**：使用离线模式，确保 `.sqlx` 目录被正确包含
3. **CI/CD**：如果没有数据库连接，确保查询缓存被提交到版本控制

## 常见问题

**Q: 为什么会出现这个错误？**
A: SQLx 的离线模式需要预编译的查询缓存文件，但这些文件缺失或过时。

**Q: 每次修改 SQL 查询都需要重新生成缓存吗？**
A: 是的，当 SQL 查询发生变化时，需要重新运行 `cargo sqlx prepare`。

**Q: 可以在没有数据库的情况下编译吗？**
A: 可以，但前提是有有效的查询缓存文件（`.sqlx` 目录中的 JSON 文件）。

**Q: 如何在 CI/CD 中处理这个问题？**
A: 要么在 CI 环境中提供数据库连接，要么将查询缓存文件提交到版本控制系统。 