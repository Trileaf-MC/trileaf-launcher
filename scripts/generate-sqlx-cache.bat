@echo off
rem SQLx 查询缓存生成脚本 - Windows 版本
setlocal enabledelayedexpansion

echo 🔧 正在生成 SQLx 查询缓存...

rem 检查是否有参数指定包路径
if "%~1"=="" (
    set PACKAGE_PATH=packages\app-lib
) else (
    set PACKAGE_PATH=%~1
)

if not exist "%PACKAGE_PATH%" (
    echo ❌ 错误：目录 %PACKAGE_PATH% 不存在
    exit /b 1
)

cd /d "%PACKAGE_PATH%"

rem 检查是否有 .cargo/config.toml 文件
if not exist ".cargo\config.toml" (
    echo ❌ 错误：找不到 .cargo\config.toml 文件
    exit /b 1
)

rem 检查是否有 migrations 目录
if not exist "migrations" (
    echo ❌ 错误：找不到 migrations 目录
    exit /b 1
)

rem 生成临时数据库路径
for /f "tokens=2 delims==" %%i in ('wmic OS Get localdatetime /value') do set datetime=%%i
set TEMP_DB=temp_%datetime:~0,14%.db
set DATABASE_URL=sqlite:%cd%\%TEMP_DB%

echo 📊 使用临时数据库：%TEMP_DB%

rem 备份原始配置
copy ".cargo\config.toml" ".cargo\config.toml.backup" > nul

rem 临时禁用离线模式
powershell -Command "(Get-Content '.cargo\config.toml') -replace 'SQLX_OFFLINE = \"true\"', '# SQLX_OFFLINE = \"true\"' | Set-Content '.cargo\config.toml'"

rem 设置环境变量
set DATABASE_URL=%DATABASE_URL%

echo 🔧 安装 SQLx CLI...
cargo install sqlx-cli --no-default-features --features sqlite

echo 🗄️ 创建临时数据库...
sqlx database create

echo ⬆️ 运行数据库迁移...
sqlx migrate run

echo 📝 生成查询缓存...
cargo sqlx prepare

echo 🧹 正在清理...
rem 恢复原始配置
move ".cargo\config.toml.backup" ".cargo\config.toml" > nul
rem 删除临时文件
del /f /q "%TEMP_DB%" 2>nul
del /f /q "%TEMP_DB%-shm" 2>nul
del /f /q "%TEMP_DB%-wal" 2>nul

echo ✅ SQLx 查询缓存生成完成！
echo 📁 缓存文件位置：%cd%\.sqlx\
echo 🚀 现在可以使用离线模式编译了 