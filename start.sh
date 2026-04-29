#!/bin/bash
#
# APP/小程序登记系统 - 启动脚本（使用 pm2 管理进程）
#

set -e

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install --production
fi

# 检查数据库
if [ ! -f "unified-apps.db" ]; then
    echo "🗄️  初始化数据库..."
    node init-db.js
fi

# 创建 uploads 目录
mkdir -p uploads

# 用 pm2 启动（崩溃自动重启）
if command -v pm2 &>/dev/null; then
    echo "🚀 使用 pm2 启动（崩溃自动重启）..."
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ 服务已启动，使用 pm2 logs app-registration 查看日志"
else
    echo "⚠️  未安装 pm2，使用普通模式启动..."
    echo "   建议安装：npm install -g pm2"
    node server.js
fi
