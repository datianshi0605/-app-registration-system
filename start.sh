#!/bin/bash
#
# APP/小程序登记系统 - 快速启动脚本
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

# 启动服务
echo "🚀 启动 APP/小程序登记管理系统..."
node server.js
