#!/bin/bash

echo "======================================"
echo "  APP/小程序登记管理系统 - 快速安装"
echo "======================================"
echo ""

# 检查是否已安装 Node.js
if ! command -v node &> /dev/null; then
    echo "📦 未检测到 Node.js，正在安装..."
    
    # 检测操作系统
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "检测到 Debian/Ubuntu 系统，正在安装 Node.js 20.x (LTS)..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        echo "检测到 CentOS/RHEL 系统，正在安装 Node.js 20.x (LTS)..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ 无法自动安装 Node.js，请手动安装："
        echo "   访问 https://nodejs.org"
        exit 1
    fi
fi

echo "✓ Node.js 已安装：$(node -v)"
echo ""

# 创建应用目录
APP_DIR="/var/www/app-registration-system"
echo "📁 创建应用目录：$APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# 复制文件
echo "📋 复制文件..."
cp -r . $APP_DIR/

# 进入目录
cd $APP_DIR

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 初始化数据库
echo "🗄️  初始化数据库..."
node scripts/init-database.js

# 创建日志目录
sudo mkdir -p /var/log/app-registration-system
sudo chown $USER:$USER /var/log/app-registration-system

echo ""
echo "======================================"
echo "  ✅ 安装完成！"
echo "======================================"
echo ""
echo "应用位置：$APP_DIR"
echo ""
echo "启动服务:"
echo "  cd $APP_DIR"
echo "  npm start"
echo ""
echo "设置开机自启 (systemd):"
echo "  sudo cp scripts/app-registration.service /etc/systemd/system/"
echo "  sudo systemctl enable app-registration"
echo "  sudo systemctl start app-registration"
echo ""
echo "访问地址：http://localhost:9999"
echo ""
