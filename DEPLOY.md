# 快速部署指南

## 🚀 5 分钟快速部署到 Linux 服务器

### 方法一：自动安装脚本（推荐）

```bash
# 1. 上传项目到服务器
scp -r deploy-package/* user@your-server:/tmp/

# 2. SSH 登录服务器
ssh user@your-server

# 3. 运行自动安装脚本
cd /tmp
chmod +x scripts/install.sh
./scripts/install.sh
```

### 方法二：手动部署

```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 上传项目
# (使用 scp 或 git clone)

# 3. 安装依赖
cd /path/to/project
npm install --production

# 4. 初始化数据库
node scripts/init-database.js

# 5. 启动服务
npm start
```

### 方法三：使用 Git 部署

```bash
# 1. 推送到 GitHub
cd deploy-package
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/app-registration-system.git
git push -u origin main

# 2. 在服务器上克隆
ssh user@your-server
git clone https://github.com/your-username/app-registration-system.git
cd app-registration-system

# 3. 安装和启动
./scripts/deploy.sh
npm start
```

## 🔧 配置 systemd 服务（开机自启）

```bash
# 1. 复制服务文件
sudo cp scripts/app-registration.service /etc/systemd/system/app-registration.service

# 2. 修改服务配置中的路径
sudo nano /etc/systemd/system/app-registration.service
# 修改 WorkingDirectory 为你的项目路径

# 3. 创建日志目录
sudo mkdir -p /var/log/app-registration-system
sudo chown www-data:www-data /var/log/app-registration-system

# 4. 启用服务
sudo systemctl daemon-reload
sudo systemctl enable app-registration
sudo systemctl start app-registration

# 5. 查看状态
sudo systemctl status app-registration

# 6. 查看日志
sudo journalctl -u app-registration -f
```

## 🌐 配置 Nginx 反向代理

```bash
# 1. 安装 Nginx
sudo apt-get install nginx

# 2. 创建配置文件
sudo nano /etc/nginx/sites-available/app-registration

# 3. 添加配置
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

# 4. 启用站点
sudo ln -s /etc/nginx/sites-available/app-registration /etc/nginx/sites-enabled/

# 5. 重启 Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 配置 HTTPS (Let's Encrypt)

```bash
# 1. 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d your-domain.com

# 3. 自动续期
sudo certbot renew --dry-run
```

## 📊 数据库备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-app-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/app-registration"
mkdir -p $BACKUP_DIR
cp /var/www/app-registration-system/apps.db $BACKUP_DIR/apps.db.$DATE
# 删除 30 天前的备份
find $BACKUP_DIR -name "apps.db.*" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-app-db.sh

# 添加到 crontab (每天凌晨 2 点备份)
crontab -e
# 添加：0 2 * * * /usr/local/bin/backup-app-db.sh
```

## 🐛 故障排查

### 查看服务状态
```bash
sudo systemctl status app-registration
```

### 查看日志
```bash
# 系统日志
sudo journalctl -u app-registration -f

# 应用日志
tail -f /var/log/app-registration-system/out.log
tail -f /var/log/app-registration-system/error.log
```

### 重启服务
```bash
sudo systemctl restart app-registration
```

### 检查端口
```bash
# 查看端口占用
sudo lsof -i :9999

# 查看防火墙
sudo ufw status
```

## 📈 性能优化

### 使用 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name app-registration

# 开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs app-registration
```

### 配置 SQLite 优化

```bash
# 编辑 server.js，在数据库连接后添加：
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');
db.run('PRAGMA cache_size = 10000');
```

## 💡 提示

1. **生产环境**建议使用 PM2 或 systemd 管理服务
2. **定期备份**数据库文件
3. **配置防火墙**只开放必要端口
4. **使用 HTTPS**保护数据安全
5. **监控日志**及时发现问题
