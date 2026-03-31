#!/bin/bash

echo "======================================"
echo "  APP/小程序登记管理系统 - 部署脚本"
echo "======================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "📦 未检测到 Node.js，正在自动安装..."
    echo ""
    
    # 检测操作系统
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "检测到 Debian/Ubuntu 系统，正在安装 Node.js 22.x (最新版)..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        echo "检测到 CentOS/RHEL 系统，正在安装 Node.js 22.x (最新版)..."
        curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
        sudo yum install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "检测到 macOS 系统"
        if command -v brew &> /dev/null; then
            echo "使用 Homebrew 安装 Node.js (最新版)..."
            brew install node
        else
            echo "❌ 未检测到 Homebrew，请先安装："
            echo "   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        echo "❌ 无法自动安装 Node.js，请手动安装："
        echo "   访问 https://nodejs.org"
        exit 1
    fi
    
    if [ $? -ne 0 ]; then
        echo "❌ Node.js 安装失败"
        exit 1
    fi
    
    echo "✓ Node.js 安装成功"
    echo ""
fi

echo "✓ Node.js 版本：$(node -v)"
echo "✓ npm 版本：$(npm -v)"
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
