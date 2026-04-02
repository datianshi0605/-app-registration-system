# APP/小程序登记系统

一个统一的 APP 和小程序登记管理平台，支持数据导入导出、统计分析等功能。

## 系统要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- Linux/macOS/Windows

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/datianshi0605/-app-registration-system.git
cd -app-registration-system
```

### 2. 一键部署（推荐）

运行部署脚本，自动完成所有安装步骤：

```bash
./scripts/deploy.sh
```

或者使用快速启动脚本：

```bash
./start.sh
```

**部署脚本自动完成：**
- ✅ 检查系统环境（Node.js、npm）
- ✅ 安装依赖（包括 SQLite 数据库驱动）
- ✅ 初始化数据库（创建数据库文件和表结构）
- ✅ 验证安装

### 3. 启动服务

```bash
npm start
```

访问 [http://localhost:9999](http://localhost:9999)

## 手动安装

如果不想使用一键部署脚本，可以手动执行：

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
node init-db.js
```

这会创建 `miniprogram.db` 数据库文件并初始化表结构。

### 3. 启动服务

```bash
npm start
```

## 开发模式

```bash
# 安装开发依赖
npm install

# 启动开发服务器（自动重启）
npm run dev
```

## 功能特性

- ✅ APP 和小程序统一管理
- ✅ 批量导入/导出 Excel
- ✅ 数据统计分析
- ✅ 搜索和筛选
- ✅ 分页显示
- ✅ 响应式设计

## 配置

### 修改端口

默认端口：9999

```bash
# 方法 1: 环境变量
export PORT=3000
npm start

# 方法 2: 修改 server.js
```

## 数据库

- **类型**: SQLite3
- **文件**: `./miniprogram.db`（自动创建）
- **表**: `registrations`（自动初始化）

无需手动配置数据库，首次运行时会自动创建。

## 项目结构

```
-app-registration-system/
├── scripts/
│   └── deploy.sh          # 一键部署脚本
├── public/                 # 前端文件
├── server.js              # 服务器主文件
├── init-db.js             # 数据库初始化脚本
├── start.sh               # 快速启动脚本
├── package.json           # 项目配置
└── README.md              # 本文档
```

## API 接口

### 获取所有登记
```
GET /api/registrations
```

### 创建登记
```
POST /api/registrations
Content-Type: application/json

{
  "appName": "小程序名称",
  "department": "部门",
  "devType": "internal|external",
  "privacyPolicy": "yes|no",
  "owner": "负责人",
  "securityOwner": "安全负责人",
  "securityVuln": "yes|no"
}
```

### 导出 Excel
```
GET /api/export
```

## 常见问题

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :9999

# 杀死进程
kill -9 <PID>

# 或修改端口
export PORT=3000
npm start
```

### 数据库问题

```bash
# 删除数据库锁文件
rm -f miniprogram.db-journal
rm -f miniprogram.db-wal
rm -f miniprogram.db-shm

# 重新初始化数据库
node init-db.js
```

### 依赖安装失败

```bash
# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 重建 sqlite3
npm rebuild sqlite3
```

## 许可证

MIT License

## 反馈

如有问题，请提交 Issue 或联系开发者。
