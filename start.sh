#!/bin/bash

# 一键启动脚本 - 完整流程：安装依赖 → 安装数据库驱动 → 初始化数据库 → 启动服务器

echo "🚀 小程序登记系统 - 一键启动"
echo "================================"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 安装依赖（包括 sqlite3 数据库驱动）
echo ""
echo "📦 正在安装依赖（包括 SQLite 数据库驱动）..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，尝试重新安装 sqlite3..."
    npm rebuild sqlite3
    npm install
fi

echo "✅ 依赖安装完成"

# 初始化数据库
echo ""
echo "🗄️  正在初始化数据库..."
node init-db.js

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

echo "✅ 数据库初始化完成"

# 启动服务器
echo ""
echo "🌐 正在启动服务器..."
echo "================================"
npm start
