# 🎉 APP/小程序登记管理系统 v1.0.0

## 📦 版本信息

- **版本号**: v1.0.0
- **发布日期**: 2026-03-31
- **分支**: main
- **类型**: 正式版本

---

## ✨ 功能特性

### 🎯 核心功能

- ✅ **APP 和小程序统一管理** - 支持 APP 和小程序的登记、编辑、删除
- ✅ **批量导入/导出** - 支持 Excel 文件批量导入和导出
- ✅ **数据统计分析** - 实时统计 APP 总量、小程序总量、开发机构总量
- ✅ **搜索和筛选** - 支持按名称、机构、类型进行搜索
- ✅ **分页显示** - 支持分页和"显示全部"模式
- ✅ **响应式设计** - 适配各种屏幕尺寸

### 🗄️ 数据库

- ✅ **自动初始化** - 部署时自动创建 SQLite 数据库和表结构
- ✅ **字段分离** - APP 和小程序字段分别管理
- ✅ **数据验证** - 完整的字段验证和约束

### 🌐 网络访问

- ✅ **局域网访问** - 支持通过 192.168.x.x 访问
- ✅ **跨平台** - 支持 Linux/macOS/Windows

---

## 🚀 快速开始

### 一键部署

```bash
# 1. 克隆项目
git clone https://github.com/datianshi0605/-app-registration-system.git
cd -app-registration-system

# 2. 运行部署脚本（自动安装 Node.js + 依赖 + 数据库）
./scripts/deploy.sh

# 3. 启动服务
npm start
```

访问：http://localhost:3000

---

## 📋 系统要求

- **Node.js**: >= 22.0.0（推荐最新版）
- **npm**: >= 6.0.0
- **操作系统**: Linux/macOS/Windows
- **内存**: >= 512MB
- **磁盘**: >= 100MB

---

## 🔧 配置说明

### 端口配置

默认端口：3000

```bash
# 修改端口
export PORT=3000
npm start
```

### 数据库

- **类型**: SQLite3
- **位置**: `./apps.db`
- **初始化**: 自动创建，无需手动配置

---

## 📦 部署方式

### 方式 1：一键部署脚本（推荐）

```bash
./scripts/deploy.sh
```

自动完成：
- ✅ 检测并安装 Node.js 22.x
- ✅ 安装项目依赖
- ✅ 初始化数据库

### 方式 2：Docker 部署

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t app-registration .
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data app-registration
```

### 方式 3：systemd 服务（生产环境）

```bash
# 1. 复制服务文件
sudo cp scripts/app-registration.service /etc/systemd/system/

# 2. 创建日志目录
sudo mkdir -p /var/log/app-registration-system
sudo chown www-data:www-data /var/log/app-registration-system

# 3. 启用服务
sudo systemctl daemon-reload
sudo systemctl enable app-registration
sudo systemctl start app-registration

# 4. 查看状态
sudo systemctl status app-registration
```

---

## 📊 API 接口

### 统计数据
```bash
GET /api/statistics
```

返回：
```json
{
  "appCount": 37,
  "miniprogramCount": 73,
  "institutionCount": 40
}
```

### 获取应用列表
```bash
GET /api/applications?page=1&limit=20
```

### 创建应用
```bash
POST /api/applications
Content-Type: application/json

{
  "appType": "app",
  "appName": "示例 APP",
  "status": "developing"
}
```

### 导入 Excel
```bash
POST /api/import
Content-Type: multipart/form-data

file: <excel-file>
```

### 导出 Excel
```bash
GET /api/export
```

---

## 🛠️ 开发模式

```bash
# 安装开发依赖
npm install

# 启动开发服务器（自动重启）
npm run dev
```

---

## 🔐 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   ```

2. **使用 HTTPS**
   - 配置 Nginx SSL
   - 使用 Let's Encrypt 免费证书

3. **定期备份**
   ```bash
   cp apps.db apps.db.backup.$(date +%Y%m%d)
   ```

---

## 🐛 已知问题

暂无已知问题。

---

## 📝 更新日志

### v1.0.0 (2026-03-31)

**新增功能**
- ✨ 初始版本发布
- ✨ APP 和小程序统一管理
- ✨ 批量导入/导出 Excel
- ✨ 数据统计分析
- ✨ 搜索和筛选功能
- ✨ 分页显示
- ✨ 响应式设计

**技术栈**
-  Node.js 22.x
- 📦 Express.js
- 📦 SQLite3
- 📦 TailwindCSS
- 📦 Chart.js

**部署优化**
- 🚀 一键部署脚本
- 🚀 自动检测并安装 Node.js
- 🚀 数据库自动初始化
- 🚀 支持局域网访问
- 🚀 Docker 支持
- 🚀 systemd 服务配置

---

## 📧 联系方式

- **仓库地址**: https://github.com/datianshi0605/-app-registration-system
- **问题反馈**: https://github.com/datianshi0605/-app-registration-system/issues

---

## 📄 许可证

MIT License

---

## 🙏 致谢

感谢所有贡献者和使用者！

---

**🎉 祝你使用愉快！**
