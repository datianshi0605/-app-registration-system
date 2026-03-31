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
else
    # 检查 Node.js 版本
    NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
    
    if [ "$NODE_VERSION" -lt 22 ]; then
        echo "⚠️  检测到 Node.js 版本过低 (v$(node -v))"
        echo "   建议升级到 Node.js 22.x (最新版)"
        echo ""
        read -p "是否现在升级？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📦 正在升级 Node.js..."
            
            # 检测操作系统
            if [ -f /etc/debian_version ]; then
                # Debian/Ubuntu
                echo "检测到 Debian/Ubuntu 系统，正在安装 Node.js 22.x..."
                curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif [ -f /etc/redhat-release ]; then
                # CentOS/RHEL
                echo "检测到 CentOS/RHEL 系统，正在安装 Node.js 22.x..."
                curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
                sudo yum install -y nodejs
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                echo "检测到 macOS 系统，使用 Homebrew 升级..."
                brew upgrade node
            else
                echo "❌ 无法自动升级，请手动安装："
                echo "   访问 https://nodejs.org"
                exit 1
            fi
            
            echo "✓ Node.js 升级成功：$(node -v)"
            echo ""
        else
            echo "⚠️  继续使用当前版本：$(node -v)"
            echo "   建议使用 Node.js 22.x 以获得最佳性能和安全性"
            echo ""
        fi
    else
        echo "✓ Node.js 版本符合要求：$(node -v)"
        echo ""
    fi
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
echo "服务将在 http://localhost:3000 运行"
echo "局域网访问：http://<your-ip>:3000"
echo ""
