#!/bin/bash

# ========================================
# APP/小程序登记系统 - 一键部署脚本
# ========================================
# 自动完成：
# 1. 检查系统环境
# 2. 安装 Node.js 依赖（包括 SQLite 数据库驱动）
# 3. 初始化数据库
# 4. 验证安装
# ========================================

set -e  # 遇到错误立即退出

echo "========================================"
echo "  APP/小程序登记系统 - 一键部署"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
echo "📦 检查系统环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 Node.js${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本：$(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 npm${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm 版本：$(npm -v)${NC}"

# 安装依赖
echo ""
echo "📦 正在安装依赖（包括 SQLite 数据库驱动）..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    echo "尝试重建 sqlite3..."
    npm rebuild sqlite3
    npm install
fi

echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 初始化数据库
echo ""
echo "🗄️  正在初始化数据库..."
node init-db.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 数据库初始化失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 数据库初始化完成${NC}"

# 验证安装
echo ""
echo "🔍 验证安装..."
if [ -f "miniprogram.db" ]; then
    echo -e "${GREEN}✅ 数据库文件已创建${NC}"
else
    echo -e "${YELLOW}⚠️  数据库文件未找到${NC}"
fi

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ 依赖已安装${NC}"
else
    echo -e "${RED}❌ 依赖未安装${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "========================================"
echo ""
echo "启动服务："
echo "  npm start"
echo ""
echo "开发模式（自动重启）："
echo "  npm run dev"
echo ""
echo "访问地址：http://localhost:9999"
echo ""
