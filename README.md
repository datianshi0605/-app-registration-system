# 小程序登记系统 - 快速启动指南

## 一键启动（推荐）

```bash
./start.sh
```

这个脚本会自动：
1. ✅ 检查并安装依赖
2. ✅ 初始化数据库（创建 `miniprogram.db` 文件）
3. ✅ 启动服务器（端口 9999）

## 手动启动

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
npm run init-db
# 或者
node init-db.js
```

### 3. 启动服务器
```bash
npm start
# 或者
node server.js
```

## 开发模式（自动重启）
```bash
npm run dev
```

## 访问地址

服务器启动后，访问：http://localhost:9999

## 数据库说明

- **类型**: SQLite3
- **文件**: `miniprogram.db`（自动创建）
- **表**: `registrations`（自动创建）

如果数据库出现问题，可以删除 `miniprogram.db` 后重新运行 `npm run init-db`

## 常见问题

### Q: 提示找不到数据库？
A: 运行 `npm run init-db` 初始化数据库

### Q: 端口被占用？
A: 修改 `server.js` 中的 PORT 环境变量或端口号

### Q: 依赖安装失败？
A: 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
