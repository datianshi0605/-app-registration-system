# APP/小程序统一登记管理系统

企业级 APP 和小程序统一登记管理平台，支持数据导入导出、统计分析、分页查询等功能。

## ✨ 功能特性

- ✅ **APP 和小程序统一管理** — 一个平台管理所有移动端应用
- ✅ **分类登记** — APP 和小程序各有专属字段（备案编号、发布平台等）
- ✅ **批量导入/导出 Excel** — 支持 APP 和小程序分别导入，自动去重
- ✅ **数据统计分析** — 类型分布、机构分布、状态分布图表
- ✅ **搜索和筛选** — 按名称、机构、类型搜索
- ✅ **分页显示** — 支持自定义每页条数，一键显示全部
- ✅ **弹窗编辑** — 现代化弹窗式编辑界面
- ✅ **下线/删除** — 支持软删除（标记下线）和永久删除
- ✅ **响应式设计** — 适配桌面和移动端

## 🚀 快速开始

### 系统要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 一键安装

```bash
git clone https://github.com/datianshi0605/-app-registration-system.git
cd -app-registration-system
chmod +x install.sh
./install.sh
```

### 启动服务

```bash
npm start
```

访问 [http://localhost:9999](http://localhost:9999)

### 快速启动（自动检查依赖和数据库）

```bash
./start.sh
```

## 📋 APP 登记字段

| 字段 | 说明 |
|------|------|
| APP 名称 | 应用名称（必填） |
| 所属团队 | 开发团队或机构（必填） |
| 主要市场 | App Store、华为、小米等 |
| APP 备案编号 | 工信部 APP 备案号 |
| ICP 备案编号 | ICP 备案号 |
| 教育备案 | 教育类 APP 备案号 |

## 📋 小程序登记字段

| 字段 | 说明 |
|------|------|
| 小程序名称 | 小程序名称（必填） |
| 所属机构 | 开发机构（必填） |
| 发布平台 | 微信、支付宝、百度等 |
| 小程序功能 | 功能描述 |
| 开发情况说明 | 开发进度 |
| 部署位置 | 部署 URL |

## 📋 公共字段

| 字段 | 说明 |
|------|------|
| 后台域名 | API 后台域名 |
| 产品负责人 | 产品 owner |
| 开发负责人 | 研发 owner |
| 应用状态 | 开发中/已上线/已下线/暂停维护 |
| 备注 | 其他说明 |

## 🔧 配置

### 修改端口

```bash
# 环境变量方式
PORT=3000 npm start
```

默认端口：**9999**

## 📁 项目结构

```
app-registration-system/
├── server.js              # 服务器主文件（APP + 小程序统一版）
├── init-db.js             # 数据库初始化脚本
├── install.sh             # 一键安装脚本
├── start.sh               # 快速启动脚本
├── scripts/
│   └── deploy.sh          # 部署脚本
├── public/
│   └── index.html         # 前端页面
├── package.json           # 项目配置
└── README.md              # 本文档
```

## 📊 API 接口

### 应用管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/applications` | 获取活跃应用列表（分页） |
| GET | `/api/applications/offline` | 获取已下线应用列表 |
| GET | `/api/applications/:id` | 获取单个应用详情 |
| POST | `/api/applications` | 创建新应用 |
| PUT | `/api/applications/:id` | 更新应用信息 |
| DELETE | `/api/applications/:id` | 标记下线 |
| DELETE | `/api/applications/:id/permanent` | 永久删除 |

### 导入导出

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/export` | 导出全部数据（Excel） |
| GET | `/api/template/app` | 下载 APP 导入模板 |
| GET | `/api/template/miniprogram` | 下载小程序导入模板 |
| POST | `/api/import` | 批量导入（Excel） |

### 统计分析

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/statistics` | 总量统计 |
| GET | `/api/analytics/type` | 类型分布 |
| GET | `/api/analytics/team` | 机构分布 |
| GET | `/api/analytics/status` | 状态分布 |

## 🗄️ 数据库

- **类型**: SQLite3
- **文件**: `unified-apps.db`（自动创建）
- **表**: `applications`

### 常见问题

```bash
# 端口被占用
lsof -i :9999
kill -9 <PID>

# 重新初始化数据库
node init-db.js

# 依赖问题
rm -rf node_modules package-lock.json
npm install
```

## 📄 许可证

MIT License
