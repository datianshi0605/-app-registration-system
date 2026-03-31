#!/bin/bash

echo "======================================"
echo "  初始化 Git 仓库并推送到 GitHub"
echo "======================================"
echo ""

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 获取仓库信息
echo "请输入 GitHub 用户名："
read -r GITHUB_USER

echo "请输入仓库名称 (默认：app-registration-system)："
read -r REPO_NAME
REPO_NAME=${REPO_NAME:-app-registration-system}

echo ""
echo "📦 初始化 Git 仓库..."
git init
git add .
git commit -m "Initial commit: APP/小程序登记管理系统"

echo ""
echo "🔗 创建远程仓库..."
echo "请在 GitHub 上创建仓库：https://github.com/new"
echo "仓库名称：$REPO_NAME"
echo "创建后按回车继续..."
read -r

echo ""
echo "📤 推送到 GitHub..."
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git branch -M main
git push -u origin main

echo ""
echo "======================================"
echo "  ✅ 推送完成！"
echo "======================================"
echo ""
echo "仓库地址：https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "在其他服务器上部署:"
echo "  git clone https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "  cd $REPO_NAME"
echo "  ./scripts/deploy.sh"
echo ""
