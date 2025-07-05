#!/bin/bash
# SQLx 查询缓存生成脚本
# 支持 Linux/macOS/Windows(WSL)

set -e

echo "🔧 正在生成 SQLx 查询缓存..."

# 检查是否有参数指定包路径
PACKAGE_PATH=${1:-"packages/app-lib"}

if [ ! -d "$PACKAGE_PATH" ]; then
    echo "❌ 错误：目录 $PACKAGE_PATH 不存在"
    exit 1
fi

cd "$PACKAGE_PATH"

# 检查是否有 .cargo/config.toml 文件
HAS_CARGO_CONFIG=false
if [ -f ".cargo/config.toml" ]; then
    HAS_CARGO_CONFIG=true
    echo "✅ 发现 .cargo/config.toml 文件"
else
    echo "⚠️  未找到 .cargo/config.toml 文件，将跳过离线模式配置"
fi

# 检查是否有 migrations 目录
if [ ! -d "migrations" ]; then
    echo "❌ 错误：找不到 migrations 目录"
    exit 1
fi

# 检测数据库类型
DB_TYPE="sqlite"
SQLX_FEATURES="sqlite"

# 检查 Cargo.toml 来确定数据库类型
if grep -q '"postgres"' Cargo.toml 2>/dev/null; then
    DB_TYPE="postgres"
    SQLX_FEATURES="postgres"
    echo "📊 检测到 PostgreSQL 数据库"
elif grep -q '"sqlite"' Cargo.toml 2>/dev/null; then
    DB_TYPE="sqlite"
    SQLX_FEATURES="sqlite"
    echo "📊 检测到 SQLite 数据库"
fi

# 生成临时数据库路径
if [ "$DB_TYPE" = "postgres" ]; then
    # 对于 PostgreSQL，我们需要检查是否有现有的 DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️  PostgreSQL 需要设置 DATABASE_URL 环境变量"
        echo "   请设置类似：export DATABASE_URL=postgres://user:password@localhost/dbname"
        echo "   或者如果你有 .env 文件，脚本会自动加载"
        
        # 尝试从 .env 文件加载
        if [ -f ".env" ]; then
            echo "📄 尝试从 .env 文件加载 DATABASE_URL..."
            set -a
            source .env
            set +a
        fi
        
        if [ -z "$DATABASE_URL" ]; then
            echo "❌ 无法找到 DATABASE_URL，请手动设置"
            exit 1
        fi
    fi
    echo "📊 使用 PostgreSQL 数据库：$DATABASE_URL"
else
    TEMP_DB="temp_$(date +%s).db"
    DATABASE_URL="sqlite:$(pwd)/$TEMP_DB"
    echo "📊 使用临时 SQLite 数据库：$TEMP_DB"
fi

# 备份原始配置（如果存在）
if [ "$HAS_CARGO_CONFIG" = true ]; then
    cp .cargo/config.toml .cargo/config.toml.backup
    # 临时禁用离线模式
    sed -i.tmp 's/SQLX_OFFLINE = "true"/# SQLX_OFFLINE = "true"/' .cargo/config.toml
    echo "🔧 临时禁用离线模式"
fi

# 设置环境变量
export DATABASE_URL

# 清理函数
cleanup() {
    echo "🧹 正在清理..."
    # 恢复原始配置（如果有备份）
    if [ "$HAS_CARGO_CONFIG" = true ] && [ -f ".cargo/config.toml.backup" ]; then
        mv .cargo/config.toml.backup .cargo/config.toml
        echo "🔧 恢复离线模式配置"
    fi
    # 删除临时文件
    rm -f .cargo/config.toml.tmp
    # 只在使用 SQLite 时删除临时数据库文件
    if [ "$DB_TYPE" = "sqlite" ] && [ -n "$TEMP_DB" ]; then
        rm -f "$TEMP_DB"
        rm -f "$TEMP_DB-shm"
        rm -f "$TEMP_DB-wal"
    fi
}

# 设置退出时的清理
trap cleanup EXIT

echo "🔧 安装 SQLx CLI..."
cargo install sqlx-cli --no-default-features --features $SQLX_FEATURES

if [ "$DB_TYPE" = "sqlite" ]; then
    echo "🗄️ 创建临时数据库..."
    sqlx database create
else
    echo "🗄️ 使用现有的 PostgreSQL 数据库..."
    # 对于 PostgreSQL，假设数据库已经存在
fi

echo "⬆️ 运行数据库迁移..."
sqlx migrate run

echo "📝 生成查询缓存..."
cargo sqlx prepare

echo "✅ SQLx 查询缓存生成完成！"
echo "📁 缓存文件位置：$(pwd)/.sqlx/"
echo "🚀 现在可以使用离线模式编译了" 