#!/bin/bash

echo "======================================"
echo "  下载并初始化数据库"
echo "======================================"
echo ""

DB_URL="https://github.com/datianshi0605/app-registration-system/releases/download/v1.0.0/apps.db"
DB_PATH="./apps.db"

# 检查是否已存在数据库
if [ -f "$DB_PATH" ]; then
    echo "⚠️  数据库文件已存在"
    echo "   位置：$DB_PATH"
    echo ""
    read -p "是否要重新下载？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 下载数据库
echo "📥 正在下载空数据库..."

if command -v curl &> /dev/null; then
    curl -L -o "$DB_PATH" "$DB_URL"
elif command -v wget &> /dev/null; then
    wget -O "$DB_PATH" "$DB_URL"
else
    echo "❌ 错误：未找到 curl 或 wget，请手动下载数据库"
    echo "   下载地址：$DB_URL"
    exit 1
fi

# 验证下载
if [ -f "$DB_PATH" ] && [ -s "$DB_PATH" ]; then
    echo "✓ 数据库下载成功"
    echo "✓ 位置：$DB_PATH"
    echo ""
    
    # 验证数据库结构
    if command -v sqlite3 &> /dev/null; then
        TABLES=$(sqlite3 "$DB_PATH" ".tables" 2>/dev/null)
        if [ "$TABLES" = "applications" ]; then
            echo "✓ 数据库结构验证通过"
        else
            echo "⚠️  警告：数据库结构可能不完整"
        fi
    fi
else
    echo "❌ 数据库下载失败"
    echo "   请手动下载：$DB_URL"
    exit 1
fi

echo ""
echo "======================================"
echo "  ✅ 数据库准备完成！"
echo "======================================"
echo ""
echo "启动服务：npm start"
echo ""
