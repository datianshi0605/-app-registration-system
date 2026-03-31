# 📦 部署包使用指南

## 🎯 快速开始（3 步完成）

### 步骤 1：下载/克隆项目

```bash
# 方式 A：从 GitHub 克隆
git clone https://github.com/datianshi0605/app-registration-system.git
cd app-registration-system

# 方式 B：下载 ZIP 包
# 1. 访问 https://github.com/datianshi0605/app-registration-system
# 2. 点击 "Code" → "Download ZIP"
# 3. 解压到任意目录
```

### 步骤 2：安装依赖

```bash
npm install --production
```

### 步骤 3：启动服务

```bash
npm start
```

**完成！** 访问 http://localhost:9999

---

## 🗄️ 数据库说明

### 已包含的内容

✅ **空数据库文件** (`apps.db`)
- 包含完整的表结构
- 没有任何数据记录
- 可以直接使用

### 数据库位置

```
app-registration-system/
├── apps.db              ← 空数据库（已包含）
├── apps.db-journal      ← 运行时生成（自动）
├── apps.db-wal          ← 运行时生成（自动）
└── apps.db-shm          ← 运行时生成（自动）
```

### 如果需要清空数据

```bash
# 删除数据库文件
rm apps.db

# 重新初始化
node scripts/init-database.js
```

---

## 📊 导入现有数据（可选）

如果你有现有的数据需要导入：

### 方式 1：通过 Web 界面导入

1. 启动服务后访问 http://localhost:9999
2. 点击"批量导入"按钮
3. 选择 Excel 文件
4. 等待导入完成

### 方式 2：直接复制数据库文件

```bash
# 备份空数据库
cp apps.db apps.db.empty

# 复制你的数据库文件
cp /path/to/your/backup.db apps.db

# 重启服务
npm start
```

---

## 🔧 配置选项

### 修改端口

```bash
# 方法 1：环境变量
export PORT=3000
npm start

# 方法 2：修改启动命令
PORT=3000 npm start
```

### 修改数据库位置

编辑 `server.js`，找到：
```javascript
const db = new sqlite3.Database('./apps.db');
```

修改为：
```javascript
const db = new sqlite3.Database('/path/to/your/apps.db');
```

---

## 📋 验证安装

启动服务后，检查以下内容：

### 1. 服务状态
```bash
curl http://localhost:9999
# 应该返回 HTML 页面
```

### 2. API 测试
```bash
curl http://localhost:9999/api/statistics
# 应该返回：{"appCount":0,"miniprogramCount":0,"institutionCount":0}
```

### 3. 数据库检查
```bash
sqlite3 apps.db ".tables"
# 应该显示：applications
```

---

## 🐛 常见问题

### Q1: 提示 "database is locked"
```bash
# 删除锁文件
rm -f apps.db-journal apps.db-wal apps.db-shm

# 重启服务
npm start
```

### Q2: 端口被占用
```bash
# 查看占用端口的进程
lsof -i :9999

# 杀死进程
kill -9 <PID>

# 或使用其他端口
export PORT=3001
npm start
```

### Q3: 权限问题
```bash
# 修复文件权限
chmod 644 apps.db
chown $(whoami) apps.db
```

---

## 📦 文件清单

| 文件 | 说明 | 必需 |
|------|------|------|
| `server.js` | 主服务器文件 | ✅ |
| `apps.db` | 空数据库 | ✅ |
| `package.json` | 项目配置 | ✅ |
| `public/index.html` | 前端页面 | ✅ |
| `scripts/` | 脚本文件 | ⭕ 可选 |
| `README.md` | 说明文档 | ⭕ 可选 |

---

## 💡 最佳实践

1. **首次部署** - 使用包含的空数据库
2. **数据迁移** - 通过 Web 界面导入 Excel
3. **定期备份** - 复制 `apps.db` 到安全位置
4. **生产环境** - 使用 systemd 或 PM2 管理服务
5. **日志管理** - 定期清理日志文件

---

## 📞 技术支持

- 详细文档：`README.md`
- 部署指南：`DEPLOY.md`
- 文件清单：`MANIFEST.md`

---

**祝你使用愉快！** 🎉
