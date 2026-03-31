#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'apps.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_type TEXT NOT NULL CHECK(app_type IN ('app', 'miniprogram')),
    product_owner TEXT,
    dev_owner TEXT,
    backend_domain TEXT,
    notes TEXT,
    status TEXT NOT NULL CHECK(status IN ('developing', 'launched', 'offline', 'paused')) DEFAULT 'developing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    app_name TEXT,
    team_or_institution TEXT,
    app_market TEXT,
    app_license_number TEXT,
    education_filing TEXT,
    miniprogram_name TEXT,
    miniprogram_institution TEXT,
    miniprogram_platform TEXT,
    miniprogram_function TEXT,
    development_status TEXT,
    deployment_location TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('✓ Database initialized successfully');
      console.log(`✓ Database location: ${dbPath}`);
    }
    db.close();
  });
});
