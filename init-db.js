#!/usr/bin/env node
/**
 * 数据库初始化脚本
 * 创建和初始化 APP/小程序统一登记数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'unified-apps.db');

console.log('📦 开始初始化数据库...');
console.log(`📍 数据库路径：${DB_PATH}`);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 创建数据库失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');

  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_type TEXT NOT NULL DEFAULT 'app' CHECK(app_type IN ('app', 'miniprogram')),
    
    -- APP 专属字段
    app_name TEXT,
    team_or_institution TEXT,
    app_market TEXT,
    app_license_number TEXT,
    icp_license_number TEXT,
    education_filing TEXT,
    
    -- 小程序专属字段
    miniprogram_name TEXT,
    miniprogram_institution TEXT,
    miniprogram_platform TEXT,
    miniprogram_function TEXT,
    development_status TEXT,
    deployment_location TEXT,
    
    -- 公共字段
    backend_domain TEXT,
    product_owner TEXT,
    dev_owner TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'launched' CHECK(status IN ('developing', 'launched', 'offline', 'paused')),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ 创建表失败:', err.message);
      db.close();
      process.exit(1);
    }
    console.log('✅ 表 applications 创建成功');

    db.get("SELECT COUNT(*) as count FROM applications", (err, row) => {
      if (err) {
        console.error('❌ 验证表结构失败:', err.message);
      } else {
        console.log(`✅ 数据库验证成功，当前记录数：${row.count}`);
        console.log('\n🎉 数据库初始化完成！');
      }
      db.close((err) => {
        if (err) {
          console.error('❌ 关闭数据库失败:', err.message);
          process.exit(1);
        }
        console.log('📴 数据库连接已关闭');
        process.exit(0);
      });
    });
  });
});
