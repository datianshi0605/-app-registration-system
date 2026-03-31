# APP/小程序登记管理系统 - 部署包清单

## 📦 文件结构

```
deploy-package/
├── server.js                 # 主服务器文件
├── package.json             # 项目配置和依赖
├── apps.db                  # 🗄️ 预初始化的空数据库
├── README.md                # 项目说明
├── DEPLOY.md                # 部署指南
├── .gitignore              # Git 忽略文件
├── public/                 # 前端文件
│   └── index.html
└── scripts/                # 脚本文件
    ├── deploy.sh           # 部署脚本
    ├── install.sh          # 自动安装脚本
    ├── init-git.sh         # Git 初始化脚本
    ├── init-database.js    # 数据库初始化（备用）
    └── app-registration.service  # systemd 服务配置
```

## 🚀 快速开始

### 1. 推送到 GitHub

```bash
cd deploy-package
./scripts/init-git.sh
```

按提示输入 GitHub 用户名和仓库名称。

### 2. 在新服务器上部署

```bash
# 克隆项目
git clone https://github.com/your-username/app-registration-system.git
cd app-registration-system

# 运行部署脚本
./scripts/deploy.sh

# 启动服务
npm start
```

访问 http://localhost:9999

## 📋 系统要求

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **操作系统**: Linux/macOS/Windows
- **内存**: >= 512MB
- **磁盘**: >= 100MB

## 🔧 配置选项

### 端口
- 默认：9999
- 修改：`export PORT=3000`

### 数据库
- 类型：SQLite3
- 位置：`./apps.db`
- 自动创建

### 上传目录
- 位置：`./uploads/`
- 自动创建

## 📊 功能列表

- ✅ APP 和小程序统一管理
- ✅ 批量导入/导出 Excel
- ✅ 数据统计分析（APP 总量、小程序总量、机构总量）
- ✅ 搜索和筛选（名称、机构、类型）
- ✅ 分页显示（可切换显示全部）
- ✅ 响应式设计
- ✅ 折叠式登记表单
- ✅ 横向详细信息展示

## 🛡️ 安全建议

1. 配置防火墙
2. 使用 HTTPS
3. 定期备份数据库
4. 限制访问 IP
5. 使用 systemd 或 PM2 管理服务

## 📞 技术支持

详见 README.md 和 DEPLOY.md
