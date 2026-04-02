#!/usr/bin/env node
/**
 * 数据库初始化脚本
 * 用于创建和初始化 SQLite 数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'miniprogram.db');

console.log('📦 开始初始化数据库...');
console.log(`📍 数据库路径：${DB_PATH}`);

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 创建数据库失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
  
  // 创建 registrations 表
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT NOT NULL,
    department TEXT NOT NULL,
    dev_type TEXT NOT NULL CHECK(dev_type IN ('internal', 'external')),
    privacy_policy TEXT NOT NULL CHECK(privacy_policy IN ('yes', 'no')),
    owner TEXT NOT NULL,
    security_owner TEXT NOT NULL,
    security_vuln TEXT NOT NULL CHECK(security_vuln IN ('yes', 'no')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ 创建表失败:', err.message);
      db.close();
      process.exit(1);
    }
    console.log('✅ 表 registrations 创建成功');
    
    // 验证表结构
    db.get("SELECT COUNT(*) as count FROM registrations", (err, row) => {
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
