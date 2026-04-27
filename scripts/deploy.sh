#!/bin/bash
#
# APP/小程序登记系统 - 部署脚本
# 使用方法: chmod +x scripts/deploy.sh && ./scripts/deploy.sh
#

set -e

echo "========================================="
echo "  APP/小程序登记管理系统 - 部署"
echo "========================================="

# 检查环境
echo ""
echo "🔍 检查系统环境..."

if ! command -v node &> /dev/null; then
    echo "❌ 需要 Node.js >= 14"
    exit 1
fi
echo "  ✅ Node.js $(node -v)"
echo "  ✅ npm $(npm -v)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install --production

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
node init-db.js

# 创建必要目录
mkdir -p uploads

# 验证安装
echo ""
echo "🔧 验证安装..."
node -e "
const express = require('express');
const sqlite3 = require('sqlite3');
const XLSX = require('xlsx');
console.log('  ✅ express 已安装');
console.log('  ✅ sqlite3 已安装');
console.log('  ✅ xlsx 已安装');
"

echo ""
echo "========================================="
echo "  🎉 部署完成！"
echo "========================================="
echo ""
echo "  启动: npm start"
echo "  访问: http://localhost:9999"
echo ""
