#!/bin/bash

echo "======================================"
echo "  数据库初始化脚本"
echo "======================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查是否已存在数据库
if [ -f "apps.db" ]; then
    echo "⚠️  数据库文件已存在"
    echo "   位置：$SCRIPT_DIR/apps.db"
    echo ""
    read -p "是否要重新初始化？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✓ 保留现有数据库"
        exit 0
    fi
    echo "🗑️  删除旧数据库..."
    rm -f apps.db apps.db-journal apps.db-wal apps.db-shm
fi

# 初始化数据库
echo "🗄️  正在初始化数据库..."
node scripts/init-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✅ 数据库初始化完成！"
    echo "======================================"
    echo ""
    echo "数据库位置：$SCRIPT_DIR/apps.db"
    echo ""
    echo "启动服务：npm start"
    echo ""
else
    echo ""
    echo "❌ 数据库初始化失败"
    exit 1
fi
