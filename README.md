# APP/小程序登记管理系统

一个统一的 APP 和小程序登记管理平台，支持数据导入导出、统计分析等功能。

## 🚀 快速部署

### 系统要求
- Node.js >= 14.0.0
- npm >= 6.0.0
- Linux/macOS/Windows

### 一键部署

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd app-registration-system

# 2. 运行部署脚本（自动安装依赖 + 初始化数据库）
./scripts/deploy.sh

# 3. 启动服务
npm start
```

访问 http://localhost:9999

### 📦 部署内容

- ✅ 完整的源代码
- ✅ **数据库初始化脚本**（自动创建空数据库）
- ✅ 前端文件
- ✅ 部署脚本
- ✅ 详细文档

## 📋 功能特性

- ✅ APP 和小程序统一管理
- ✅ 批量导入/导出 Excel
- ✅ 数据统计分析
- ✅ 搜索和筛选
- ✅ 分页显示
- ✅ 响应式设计

## 🔧 配置

### 端口配置
默认端口：9999

修改方法：
```bash
# 方法 1: 环境变量
export PORT=3000
npm start

# 方法 2: 修改 .env 文件
PORT=3000
```

### 数据库
- 类型：SQLite3
- 位置：`./apps.db`
- 自动创建，无需手动配置

## 📦 生产环境部署

### 使用 systemd (推荐)

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

# 5. 查看日志
sudo journalctl -u app-registration -f
```

### 使用 Docker

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 9999
CMD ["node", "server.js"]
```

构建和运行：
```bash
docker build -t app-registration .
docker run -d -p 9999:9999 -v $(pwd)/data:/app/data app-registration
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ 开发模式

```bash
# 安装开发依赖
npm install

# 启动开发服务器 (自动重启)
npm run dev
```

## 📊 数据库备份

```bash
# 备份数据库
cp apps.db apps.db.backup.$(date +%Y%m%d)

# 恢复数据库
cp apps.db.backup.20260331 apps.db
```

## 🔐 安全建议

1. **防火墙配置**
   ```bash
   # 只允许特定 IP 访问
   sudo ufw allow from 192.168.1.0/24 to any port 9999
   ```

2. **使用 HTTPS**
   - 配置 Nginx SSL
   - 使用 Let's Encrypt 免费证书

3. **定期备份**
   ```bash
   # 添加到 crontab
   0 2 * * * cp /var/www/app-registration-system/apps.db /backup/apps.db.$(date +\%Y\%m\%d)
   ```

## 📝 API 接口

### 获取应用列表
```
GET /api/applications?page=1&limit=20
```

### 创建应用
```
POST /api/applications
Content-Type: application/json

{
  "appType": "app",
  "appName": "示例 APP",
  "status": "developing"
}
```

### 导入 Excel
```
POST /api/import
Content-Type: multipart/form-data

file: <excel-file>
```

### 导出 Excel
```
GET /api/export
```

### 统计数据
```
GET /api/statistics
```

## 🐛 常见问题

### 端口被占用
```bash
# 查看占用端口的进程
lsof -i :9999

# 杀死进程
kill -9 <PID>

# 或修改端口
export PORT=3000
```

### 数据库锁定
```bash
# 删除数据库锁文件
rm -f apps.db-journal
rm -f apps.db-wal
rm -f apps.db-shm
```

### 权限问题
```bash
# 修复文件权限
sudo chown -R www-data:www-data /var/www/app-registration-system
sudo chmod -R 755 /var/www/app-registration-system
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue 或联系开发者。
