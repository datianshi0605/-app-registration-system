#!/bin/bash
#
# APP/小程序登记系统 - 一键安装脚本
# 使用方法: chmod +x install.sh && ./install.sh
#

set -e

echo "========================================="
echo "  APP/小程序登记管理系统 - 一键安装"
echo "========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js >= 14"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js 版本过低 ($(node -v))，需要 >= 14"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi
echo "✅ npm 版本: $(npm -v)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install --production
echo "✅ 依赖安装完成"

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
node init-db.js
echo "✅ 数据库初始化完成"

# 创建 uploads 目录
mkdir -p uploads

echo ""
echo "========================================="
echo "  🎉 安装完成！"
echo "========================================="
echo ""
echo "  启动服务: npm start"
echo "  开发模式: npm run dev"
echo "  访问地址: http://localhost:9999"
echo ""
echo "  默认端口 9999，可通过环境变量修改："
echo "  PORT=3000 npm start"
echo ""
