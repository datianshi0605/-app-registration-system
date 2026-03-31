# 推送到 GitHub 指南

## 🔐 创建 Personal Access Token（推荐）

### 步骤 1：生成 Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写信息：
   - **Note**: `app-registration-system`
   - **Expiration**: `No expiration` (或选择合适的时间)
   - **Scopes**: 勾选 `repo` (完整仓库权限)
4. 点击 "Generate token"
5. **复制生成的 token**（只显示一次，请妥善保存！）

### 步骤 2：推送到 GitHub

```bash
cd /Users/paul/.openclaw/workspace-pm-dev/deploy-package

# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit: APP/小程序登记管理系统"

# 2. 在 GitHub 上创建空仓库
# 访问：https://github.com/new
# 仓库名：app-registration-system
# 不要勾选 "Add a README file"

# 3. 关联远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/app-registration-system.git

# 4. 推送（使用 token 代替密码）
git branch -M main
git push -u origin main
# 当提示输入密码时，粘贴你的 Personal Access Token
```

### 方案二：使用 SSH 密钥（更安全）

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your-email@example.com"

# 2. 添加公钥到 GitHub
# 访问：https://github.com/settings/keys
# 复制 ~/.ssh/id_ed25519.pub 的内容

# 3. 使用 SSH 地址推送
git remote add origin git@github.com:YOUR_USERNAME/app-registration-system.git
git push -u origin main
```

## 🚀 快速推送命令

复制以下命令，替换 `YOUR_USERNAME` 和 `YOUR_TOKEN`：

```bash
cd /Users/paul/.openclaw/workspace-pm-dev/deploy-package

git init
git add .
git commit -m "Initial commit: APP/小程序登记管理系统"
git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/app-registration-system.git
git branch -M main
git push -u origin main
```

## 📋 在服务器上部署

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/app-registration-system.git
cd app-registration-system

# 2. 部署
./scripts/deploy.sh

# 3. 启动
npm start
```

访问 http://localhost:9999

## 💡 提示

- Token 只显示一次，请妥善保存
- 可以将 Token 保存在 Git 凭据管理器中：
  ```bash
  git config --global credential.helper store
  ```
- 使用 SSH 密钥比 Token 更安全
