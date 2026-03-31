#!/bin/bash

echo "======================================"
echo "  APP/小程序登记管理系统 - 部署脚本"
echo "======================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js，请先安装 Node.js (>= 14.0.0)"
    echo "   访问 https://nodejs.org 下载安装"
    exit 1
fi

echo "✓ Node.js 版本：$(node -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✓ 依赖安装完成"
echo ""

# 初始化数据库
echo "🗄️  初始化数据库..."
node scripts/init-database.js

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

echo ""
echo "======================================"
echo "  ✅ 部署完成！"
echo "======================================"
echo ""
echo "启动服务:"
echo "  npm start"
echo ""
echo "开发模式 (自动重启):"
echo "  npm run dev"
echo ""
echo "服务将在 http://localhost:9999 运行"
echo ""
