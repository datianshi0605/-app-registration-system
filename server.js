const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 9999;

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database with separate fields for APP and MiniProgram
const db = new sqlite3.Database('./unified-apps.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database with separate APP/MiniProgram fields');
    // 自动建表
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_type TEXT NOT NULL DEFAULT 'app' CHECK(app_type IN ('app', 'miniprogram')),
      app_name TEXT,
      team_or_institution TEXT,
      app_market TEXT,
      app_license_number TEXT,
      icp_license_number TEXT,
      education_filing TEXT,
      miniprogram_name TEXT,
      miniprogram_institution TEXT,
      miniprogram_platform TEXT,
      miniprogram_function TEXT,
      development_status TEXT,
      deployment_location TEXT,
      backend_domain TEXT,
      product_owner TEXT,
      dev_owner TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'launched' CHECK(status IN ('developing', 'launched', 'offline', 'paused')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Applications table ready');
      }
    });
  }
});

// Helper functions for display formatting
function formatStatus(status) {
  const map = {
    'developing': '开发中',
    'launched': '已上线',
    'offline': '已下线', 
    'paused': '暂停维护'
  };
  return map[status] || status;
}

function formatAppType(appType) {
  const map = {
    'app': 'APP',
    'miniprogram': '小程序'
  };
  return map[appType] || appType;
}

// Check for duplicate applications
function checkDuplicate(appType, appName, miniprogramName, callback) {
  let query = '';
  let params = [];
  
  if (appType === 'app') {
    query = 'SELECT id, app_name FROM applications WHERE app_type = ? AND app_name = ? AND status != "offline"';
    params = [appType, appName];
  } else {
    query = 'SELECT id, miniprogram_name FROM applications WHERE app_type = ? AND miniprogram_name = ? AND status != "offline"';
    params = [appType, miniprogramName];
  }
  
  db.get(query, params, (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
}

// API Routes

// Get distinct institution/team names for autocomplete dropdown
app.get('/api/institutions', (req, res) => {
  const { q = '', type = '' } = req.query;
  let query = `
    SELECT DISTINCT institution FROM (
      SELECT team_or_institution AS institution FROM applications 
        WHERE team_or_institution IS NOT NULL AND team_or_institution != ''
      UNION
      SELECT miniprogram_institution AS institution FROM applications 
        WHERE miniprogram_institution IS NOT NULL AND miniprogram_institution != ''
    )
    WHERE institution LIKE ?
    ORDER BY institution
    LIMIT 20
  `;
  const params = [`%${q}%`];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(r => r.institution));
  });
});

// Get all active applications (non-offline) with pagination
app.get('/api/applications', (req, res) => {
  const { name, institution, appType: filterAppType, page = 1, limit = 20, showAll = false } = req.query;
  
  // If showAll is true, set limit to a large number and remove status filter
  const actualLimit = showAll === 'true' ? 10000 : parseInt(limit);
  
  let query = 'SELECT * FROM applications';
  const params = [];
  const whereClauses = [];
  
  // Add status filter only if showAll is false
  if (showAll !== 'true') {
    whereClauses.push('status != ?');
    params.push('offline');
  }
  
  // Add search conditions
  if (name) {
    whereClauses.push('(app_name LIKE ? OR miniprogram_name LIKE ?)');
    params.push(`%${name}%`, `%${name}%`);
  }
  
  if (institution) {
    whereClauses.push('(team_or_institution LIKE ? OR miniprogram_institution LIKE ?)');
    params.push(`%${institution}%`, `%${institution}%`);
  }
  
  if (filterAppType) {
    whereClauses.push('app_type = ?');
    params.push(filterAppType);
  }
  
  // Add WHERE clause if there are any conditions
  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  // Get total count first (for pagination, but not when showAll=true)
  if (showAll !== 'true') {
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    db.get(countQuery, params, (err, countRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const total = countRow.total;
      const offset = (parseInt(page) - 1) * actualLimit;
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(actualLimit, offset);
      
      db.all(query, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          data: rows,
          pagination: {
            current_page: parseInt(page),
            per_page: actualLimit,
            total: total,
            total_pages: Math.ceil(total / actualLimit)
          }
        });
      });
    });
  } else {
    // When showAll is true, don't paginate
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        data: rows,
        pagination: {
          current_page: 1,
          per_page: rows.length,
          total: rows.length,
          total_pages: 1
        }
      });
    });
  }
});

// Get offline applications only with pagination
app.get('/api/applications/offline', (req, res) => {
  const { name, institution, appType: filterAppType, page = 1, limit = 20, showAll = false } = req.query;
  
  const actualLimit = showAll === 'true' ? 10000 : parseInt(limit);
  
  let query = 'SELECT * FROM applications';
  const params = [];
  const whereClauses = [];
  
  // Add status filter only if showAll is false
  if (showAll !== 'true') {
    whereClauses.push('status = ?');
    params.push('offline');
  }
  
  // Add search conditions
  if (name) {
    whereClauses.push('(app_name LIKE ? OR miniprogram_name LIKE ?)');
    params.push(`%${name}%`, `%${name}%`);
  }
  
  if (institution) {
    whereClauses.push('(team_or_institution LIKE ? OR miniprogram_institution LIKE ?)');
    params.push(`%${institution}%`, `%${institution}%`);
  }
  
  if (filterAppType) {
    whereClauses.push('app_type = ?');
    params.push(filterAppType);
  }
  
  // Add WHERE clause if there are any conditions
  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  if (showAll !== 'true') {
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    db.get(countQuery, params, (err, countRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const total = countRow.total;
      const offset = (parseInt(page) - 1) * actualLimit;
      
      query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      params.push(actualLimit, offset);
      
      db.all(query, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          data: rows,
          pagination: {
            current_page: parseInt(page),
            per_page: actualLimit,
            total: total,
            total_pages: Math.ceil(total / actualLimit)
          }
        });
      });
    });
  } else {
    query += ' ORDER BY updated_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        data: rows,
        pagination: {
          current_page: 1,
          per_page: rows.length,
          total: rows.length,
          total_pages: 1
        }
      });
    });
  }
});

// Get single application
app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM applications WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json(row);
  });
});

// Create new application
app.post('/api/applications', (req, res) => {
  const { 
    appType,
    // Common fields
    productOwner, devOwner, backendDomain, notes, status,
    // APP fields
    appName, teamOrInstitution, appMarket, appLicenseNumber, educationFiling,
    // MiniProgram fields
    miniprogramName, miniprogramInstitution, miniprogramPlatform, miniprogramFunction, developmentStatus, deploymentLocation
  } = req.body;
  
  // Validation
  if (!status) {
    return res.status(400).json({ error: '状态字段是必需的' });
  }
  
  if (!appType || !['app', 'miniprogram'].includes(appType)) {
    return res.status(400).json({ error: '应用类型必须是 "app" 或 "miniprogram"' });
  }
  
  // Check for duplicates
  const nameToCheck = appType === 'app' ? appName : miniprogramName;
  if (!nameToCheck) {
    return res.status(400).json({ error: appType === 'app' ? 'APP名称是必需的' : '小程序名称是必需的' });
  }
  
  checkDuplicate(appType, appName, miniprogramName, (err, existingApp) => {
    if (err) {
      return res.status(500).json({ error: '检查重复时发生错误' });
    }
    
    if (existingApp) {
      return res.status(409).json({ 
        error: `重复的应用名称: "${nameToCheck}" 已存在 (ID: ${existingApp.id})`,
        duplicate: true,
        existingId: existingApp.id
      });
    }
    
    const stmt = db.prepare(`INSERT INTO applications 
      (app_type, product_owner, dev_owner, backend_domain, notes, status,
       app_name, team_or_institution, app_market, app_license_number, education_filing,
       miniprogram_name, miniprogram_institution, miniprogram_platform, miniprogram_function, development_status, deployment_location) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
    stmt.run([
      appType || 'app',
      productOwner || null, devOwner || null, backendDomain || null, notes || null, status || 'developing',
      appName || null, teamOrInstitution || null, appMarket || null, appLicenseNumber || null, educationFiling || null,
      miniprogramName || null, miniprogramInstitution || null, miniprogramPlatform || null, miniprogramFunction || null, developmentStatus || null, deploymentLocation || null
    ], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Application registered successfully' });
    });
    stmt.finalize();
  });
});

// Update application
app.put('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const { 
    appType,
    // Common fields
    productOwner, devOwner, backendDomain, notes, status,
    // APP fields
    appName, teamOrInstitution, appMarket, appLicenseNumber, educationFiling,
    // MiniProgram fields
    miniprogramName, miniprogramInstitution, miniprogramPlatform, miniprogramFunction, developmentStatus, deploymentLocation
  } = req.body;
  
  // Validation
  if (!status) {
    return res.status(400).json({ error: '状态字段是必需的' });
  }
  
  if (!appType || !['app', 'miniprogram'].includes(appType)) {
    return res.status(400).json({ error: '应用类型必须是 "app" 或 "miniprogram"' });
  }
  
  const stmt = db.prepare(`UPDATE applications SET 
    app_type = ?,
    product_owner = ?,
    dev_owner = ?,
    backend_domain = ?,
    notes = ?,
    status = ?,
    app_name = ?,
    team_or_institution = ?,
    app_market = ?,
    app_license_number = ?,
    education_filing = ?,
    miniprogram_name = ?,
    miniprogram_institution = ?,
    miniprogram_platform = ?,
    miniprogram_function = ?,
    development_status = ?,
    deployment_location = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`);
    
  stmt.run([
    appType || 'app',
    productOwner || null, devOwner || null, backendDomain || null, notes || null, status || 'developing',
    appName || null, teamOrInstitution || null, appMarket || null, appLicenseNumber || null, educationFiling || null,
    miniprogramName || null, miniprogramInstitution || null, miniprogramPlatform || null, miniprogramFunction || null, developmentStatus || null, deploymentLocation || null,
    id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({ message: 'Application updated successfully' });
  });
  stmt.finalize();
});

// "Delete" application - mark as offline
app.delete('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['offline', id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({ message: 'Application marked as offline successfully' });
  });
});

// Permanent delete (for sample data cleanup)
app.delete('/api/applications/:id/permanent', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM applications WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({ message: 'Application permanently deleted successfully' });
  });
});

// Export template - Separate templates for APP and MiniProgram
app.get('/api/template/:type', (req, res) => {
  const { type } = req.params;
  
  if (type === 'app') {
    const appTemplateData = [
      {
        '序号': '',
        '类型': 'APP',
        'APP名称': '示例APP',
        '所属团队': '示例团队',
        '主要市场': 'App Store, 华为应用市场',
        'APP备案编号': '123456789',
        '教育备案': '教备2023-001',
        '后台域名': 'admin.example.com',
        '产品负责人': '张三',
        '研发负责人': '李四',
        '状态': '已上线',
        '备注': '示例APP备注'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(appTemplateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'APP导入模板');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = 'APP导入模板.xlsx';
    const encodedFilename = encodeURIComponent(filename);
    
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } else if (type === 'miniprogram') {
    const miniprogramTemplateData = [
      {
        '序号': '',
        '类型': '小程序',
        '小程序名称': '示例小程序',
        '小程序所属机构': '示例机构',
        '小程序发布平台': '微信小程序, 支付宝小程序',
        '小程序功能': '用户管理、订单处理、支付功能',
        '开发情况说明': '已完成核心功能，正在测试阶段',
        '小程序部署位置': 'https://example.com/miniprogram',
        '后台域名': 'api.example.com',
        '产品负责人': '王五',
        '开发负责人': '赵六',
        '状态': '开发中',
        '备注': '示例小程序备注'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(miniprogramTemplateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '小程序导入模板');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = '小程序导入模板.xlsx';
    const encodedFilename = encodeURIComponent(filename);
    
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } else {
    res.status(400).json({ error: 'Invalid template type. Use "app" or "miniprogram"' });
  }
});

// Import from Excel - Handle both APP and MiniProgram with duplicate checking
app.post('/api/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    let errors = [];
    let duplicates = [];
    
    // Process each row sequentially to handle async duplicate checks
    let currentIndex = 0;
    
    const processNextRow = () => {
      if (currentIndex >= jsonData.length) {
        // All rows processed
        fs.unlinkSync(req.file.path);
        
        const result = {
          message: `导入完成: ${successCount} 成功, ${duplicateCount} 重复跳过, ${errorCount} 失败`,
          success: successCount,
          duplicates: duplicateCount,
          errors: errorCount
        };
        
        if (duplicates.length > 0) {
          result.duplicateList = duplicates;
        }
        if (errors.length > 0) {
          result.errorList = errors;
        }
        
        res.json(result);
        return;
      }
      
      const row = jsonData[currentIndex];
      const rowIndex = currentIndex + 2;
      
      try {
        // Determine app type
        let appType = 'app';
        let isMiniprogram = false;
        
        if (row['类型']) {
          if (row['类型'].includes('小程序') || row['类型'].toLowerCase().includes('mini')) {
            appType = 'miniprogram';
            isMiniprogram = true;
          }
        } else if (row['小程序名称'] || row['小程序所属机构']) {
          appType = 'miniprogram';
          isMiniprogram = true;
        }
        
        // Parse status
        let status = 'launched';
        if (row['状态']) {
          const statusMap = {
            '开发中': 'developing',
            '已上线': 'launched', 
            '已下线': 'offline',
            '暂停维护': 'paused'
          };
          status = statusMap[row['状态']] || 'launched';
        }
        
        // Extract name for duplicate checking
        const appName = row['APP名称'] || row['名称'];
        const miniprogramName = row['小程序名称'];
        const nameToCheck = isMiniprogram ? miniprogramName : appName;
        
        if (!nameToCheck) {
          errorCount++;
          errors.push(`第${rowIndex}行: 缺少应用名称`);
          currentIndex++;
          processNextRow();
          return;
        }
        
        // Check for duplicate
        checkDuplicate(appType, appName, miniprogramName, (err, existingApp) => {
          if (err) {
            errorCount++;
            errors.push(`第${rowIndex}行: 检查重复时发生错误 - ${err.message}`);
            currentIndex++;
            processNextRow();
            return;
          }
          
          if (existingApp) {
            duplicateCount++;
            duplicates.push({
              row: rowIndex,
              name: nameToCheck,
              existingId: existingApp.id
            });
            currentIndex++;
            processNextRow();
            return;
          }
          
          // No duplicate, proceed with insertion
          if (isMiniprogram) {
            const application = {
              appType: 'miniprogram',
              miniprogramName: miniprogramName,
              miniprogramInstitution: row['小程序所属机构'] || row['所属机构'],
              miniprogramPlatform: row['小程序发布平台'] || row['发布平台'],
              miniprogramFunction: row['小程序功能'] || row['功能'],
              developmentStatus: row['开发情况说明'] || row['开发说明'],
              deploymentLocation: row['小程序部署位置'] || row['部署位置'],
              backendDomain: row['后台域名'],
              productOwner: row['产品负责人'],
              devOwner: row['开发负责人'] || row['研发负责人'],
              notes: row['备注'],
              status: status
            };
            
            const stmt = db.prepare(`INSERT INTO applications 
              (app_type, miniprogram_name, miniprogram_institution, miniprogram_platform, miniprogram_function, development_status, deployment_location,
               backend_domain, product_owner, dev_owner, notes, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
              
            stmt.run([
              application.appType,
              application.miniprogramName || null,
              application.miniprogramInstitution || null,
              application.miniprogramPlatform || null,
              application.miniprogramFunction || null,
              application.developmentStatus || null,
              application.deploymentLocation || null,
              application.backendDomain || null,
              application.productOwner || null,
              application.devOwner || null,
              application.notes || null,
              application.status || 'launched'
            ], function(insertErr) {
              if (insertErr) {
                errorCount++;
                errors.push(`第${rowIndex}行: ${insertErr.message}`);
              } else {
                successCount++;
              }
              stmt.finalize();
              currentIndex++;
              processNextRow();
            });
          } else {
            const application = {
              appType: 'app',
              appName: appName,
              teamOrInstitution: row['所属团队'] || row['所属机构'],
              appMarket: row['主要市场'] || row['主要应用市场'],
              appLicenseNumber: row['APP备案编号'] || row['备案编号'],
              educationFiling: row['教育备案'],
              backendDomain: row['后台域名'],
              productOwner: row['产品负责人'],
              devOwner: row['研发负责人'] || row['开发负责人'],
              notes: row['备注'],
              status: status
            };
            
            const stmt = db.prepare(`INSERT INTO applications 
              (app_type, app_name, team_or_institution, app_market, app_license_number, education_filing,
               backend_domain, product_owner, dev_owner, notes, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
              
            stmt.run([
              application.appType,
              application.appName || null,
              application.teamOrInstitution || null,
              application.appMarket || null,
              application.appLicenseNumber || null,
              application.educationFiling || null,
              application.backendDomain || null,
              application.productOwner || null,
              application.devOwner || null,
              application.notes || null,
              application.status || 'launched'
            ], function(insertErr) {
              if (insertErr) {
                errorCount++;
                errors.push(`第${rowIndex}行: ${insertErr.message}`);
              } else {
                successCount++;
              }
              stmt.finalize();
              currentIndex++;
              processNextRow();
            });
          }
        });
        
      } catch (error) {
        errorCount++;
        errors.push(`第${rowIndex}行: ${error.message}`);
        currentIndex++;
        processNextRow();
      }
    };
    
    // Start processing
    processNextRow();
    
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Import error:', error);
    res.status(500).json({ error: '文件处理失败: ' + error.message });
  }
});

// Export to Excel - Handle both types
app.get('/api/export', (req, res) => {
  db.all('SELECT * FROM applications ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }
    
    const appData = [];
    const miniprogramData = [];
    
    rows.forEach(row => {
      if (row.app_type === 'app') {
        appData.push({
          '序号': appData.length + 1,
          '类型': 'APP',
          'APP名称': row.app_name || '',
          '所属团队': row.team_or_institution || '',
          '主要市场': row.app_market || '',
          'APP备案编号': row.app_license_number || '',
          '教育备案': row.education_filing || '',
          '后台域名': row.backend_domain || '',
          '产品负责人': row.product_owner || '',
          '研发负责人': row.dev_owner || '',
          '状态': formatStatus(row.status),
          '备注': row.notes || ''
        });
      } else if (row.app_type === 'miniprogram') {
        miniprogramData.push({
          '序号': miniprogramData.length + 1,
          '类型': '小程序',
          '小程序名称': row.miniprogram_name || '',
          '小程序所属机构': row.miniprogram_institution || '',
          '小程序发布平台': row.miniprogram_platform || '',
          '小程序功能': row.miniprogram_function || '',
          '开发情况说明': row.development_status || '',
          '小程序部署位置': row.deployment_location || '',
          '后台域名': row.backend_domain || '',
          '产品负责人': row.product_owner || '',
          '研发负责人': row.dev_owner || '',
          '状态': formatStatus(row.status),
          '备注': row.notes || ''
        });
      }
    });
    
    const wb = XLSX.utils.book_new();
    
    if (appData.length > 0) {
      const appWs = XLSX.utils.json_to_sheet(appData);
      XLSX.utils.book_append_sheet(wb, appWs, 'APP登记表');
    }
    
    if (miniprogramData.length > 0) {
      const miniprogramWs = XLSX.utils.json_to_sheet(miniprogramData);
      XLSX.utils.book_append_sheet(wb, miniprogramWs, '小程序登记表');
    }
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = '统一登记表.xlsx';
    const encodedFilename = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// Statistics endpoint
// Version API - read from package.json
app.get('/api/version', (req, res) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    res.json({ version: pkg.version });
  } catch (e) {
    res.json({ version: 'unknown' });
  }
});

app.get('/api/statistics', (req, res) => {
  // Get APP count
  db.get('SELECT COUNT(*) as count FROM applications WHERE app_type = ? AND status != ?', ['app', 'offline'], (err, appRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get MiniProgram count
    db.get('SELECT COUNT(*) as count FROM applications WHERE app_type = ? AND status != ?', ['miniprogram', 'offline'], (err, mpRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Get institution count
      db.all(`SELECT DISTINCT 
                CASE 
                  WHEN app_type = 'app' THEN team_or_institution
                  WHEN app_type = 'miniprogram' THEN miniprogram_institution
                END as institution
              FROM applications 
              WHERE status != 'offline'
              AND (team_or_institution IS NOT NULL OR miniprogram_institution IS NOT NULL)`, 
      [], (err, instRows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const institutionCount = instRows.filter(row => row.institution !== null).length;
        
        res.json({
          appCount: appRow.count || 0,
          miniprogramCount: mpRow.count || 0,
          institutionCount: institutionCount
        });
      });
    });
  });
});

// Analytics endpoints
app.get('/api/analytics/type', (req, res) => {
  db.all(`SELECT app_type, COUNT(*) as count 
          FROM applications 
          WHERE status != 'offline'
          GROUP BY app_type`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({
      type: formatAppType(row.app_type),
      count: row.count
    })));
  });
});

app.get('/api/analytics/team', (req, res) => {
  db.all(`SELECT 
            CASE 
              WHEN app_type = 'app' THEN team_or_institution
              WHEN app_type = 'miniprogram' THEN miniprogram_institution
            END as institution,
            COUNT(*) as count 
          FROM applications 
          WHERE (team_or_institution IS NOT NULL OR miniprogram_institution IS NOT NULL) 
            AND status != 'offline'
          GROUP BY 
            CASE 
              WHEN app_type = 'app' THEN team_or_institution
              WHEN app_type = 'miniprogram' THEN miniprogram_institution
            END
          ORDER BY count DESC 
          LIMIT 10`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const filteredRows = rows.filter(row => row.institution !== null);
    res.json(filteredRows);
  });
});

app.get('/api/analytics/status', (req, res) => {
  db.all(`SELECT status, COUNT(*) as count 
          FROM applications 
          WHERE status != 'offline'
          GROUP BY status`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({
      status: formatStatus(row.status),
      count: row.count
    })));
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Update management endpoints
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

// Upload update package
app.post('/api/update/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, error: '未上传文件' });
  }

  const logs = [];
  const updateCode = req.body.updateCode === 'true';
  const updateDb = req.body.updateDb === 'true';
  const installDeps = req.body.installDeps === 'true';

  try {
    const zip = new AdmZip(req.file.path);
    const entries = zip.getEntries();

    // Find the root folder in zip (GitHub adds a folder like repo-master/)
    let zipRoot = '';
    for (const entry of entries) {
      if (entry.entryName.endsWith('/server.js')) {
        zipRoot = entry.entryName.replace('server.js', '');
        break;
      }
    }

    if (updateCode) {
      // Extract server.js
      const serverEntry = entries.find(e => e.entryName === zipRoot + 'server.js');
      if (serverEntry) {
        fs.writeFileSync(path.join(__dirname, 'server.js'), serverEntry.getData());
        logs.push({ type: 'success', message: 'server.js 已更新' });
      } else {
        logs.push({ type: 'warning', message: '未找到 server.js' });
      }

      // Extract public/index.html
      const indexEntry = entries.find(e => e.entryName === zipRoot + 'public/index.html');
      if (indexEntry) {
        if (!fs.existsSync(path.join(__dirname, 'public'))) {
          fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
        }
        fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), indexEntry.getData());
        logs.push({ type: 'success', message: 'public/index.html 已更新' });
      }

      // Extract public/update.html
      const updateEntry = entries.find(e => e.entryName === zipRoot + 'public/update.html');
      if (updateEntry) {
        fs.writeFileSync(path.join(__dirname, 'public', 'update.html'), updateEntry.getData());
        logs.push({ type: 'success', message: 'public/update.html 已更新' });
      }

      // Extract package.json
      const pkgEntry = entries.find(e => e.entryName === zipRoot + 'package.json');
      if (pkgEntry) {
        fs.writeFileSync(path.join(__dirname, 'package.json'), pkgEntry.getData());
        logs.push({ type: 'success', message: 'package.json 已更新' });
      }

      // Extract init-db.js
      const initDbEntry = entries.find(e => e.entryName === zipRoot + 'init-db.js');
      if (initDbEntry) {
        fs.writeFileSync(path.join(__dirname, 'init-db.js'), initDbEntry.getData());
        logs.push({ type: 'success', message: 'init-db.js 已更新' });
      }

      // Extract install.sh, start.sh
      ['install.sh', 'start.sh'].forEach(f => {
        const entry = entries.find(e => e.entryName === zipRoot + f);
        if (entry) {
          fs.writeFileSync(path.join(__dirname, f), entry.getData());
          fs.chmodSync(path.join(__dirname, f), '755');
          logs.push({ type: 'success', message: `${f} 已更新` });
        }
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Install deps if requested
    if (installDeps) {
      logs.push({ type: 'info', message: '正在安装依赖...' });
      exec('npm install --production', { cwd: __dirname }, (err) => {
        if (err) {
          logs.push({ type: 'error', message: '依赖安装失败: ' + err.message });
        } else {
          logs.push({ type: 'success', message: '依赖安装完成' });
        }

        if (updateDb) {
          runDbMigration(logs, () => res.json({ success: true, logs }));
        } else {
          res.json({ success: true, logs });
        }
      });
    } else if (updateDb) {
      runDbMigration(logs, () => res.json({ success: true, logs }));
    } else {
      res.json({ success: true, logs });
    }
  } catch (error) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ success: false, error: '解压失败: ' + error.message });
  }
});

function runDbMigration(logs, callback) {
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_type TEXT NOT NULL DEFAULT 'app' CHECK(app_type IN ('app', 'miniprogram')),
    app_name TEXT, team_or_institution TEXT, app_market TEXT,
    app_license_number TEXT, icp_license_number TEXT, education_filing TEXT,
    miniprogram_name TEXT, miniprogram_institution TEXT, miniprogram_platform TEXT,
    miniprogram_function TEXT, development_status TEXT, deployment_location TEXT,
    backend_domain TEXT, product_owner TEXT, dev_owner TEXT, notes TEXT,
    status TEXT NOT NULL DEFAULT 'launched' CHECK(status IN ('developing', 'launched', 'offline', 'paused')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      logs.push({ type: 'error', message: '数据库更新失败: ' + err.message });
    } else {
      logs.push({ type: 'success', message: '数据库结构已同步' });
    }
    callback();
  });
}

app.post('/api/update/pull', (req, res) => {
  // First check if git is available and if this is a git repo
  exec('git rev-parse --git-dir', { cwd: __dirname }, (gitError) => {
    if (gitError) {
      res.json({ 
        success: false, 
        error: '当前目录不是 Git 仓库，无法使用在线更新。请使用"上传更新包"方式，或在服务器上手动执行 git clone。',
        hint: 'not_a_git_repo'
      });
      return;
    }

    // Try to pull
    exec('git pull origin master', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        let errorMsg = stderr || error.message;
        let hint = '';
        if (errorMsg.includes('Could not resolve hostname') || errorMsg.includes('network is unreachable')) {
          hint = '无法连接 GitHub，请检查服务器网络设置';
        } else if (errorMsg.includes('Permission denied') || errorMsg.includes('authentication')) {
          hint = 'Git 认证失败，请检查 SSH key 或 GitHub token';
        } else if (errorMsg.includes('fatal:')) {
          hint = errorMsg.split('\n').find(l => l.includes('fatal:'));
        }
        res.json({ success: false, error: errorMsg, hint: hint });
        return;
      }
      if (stdout.includes('Already up to date.')) {
        res.json({ success: true, message: '已是最新版本', alreadyLatest: true });
      } else {
        res.json({ success: true, message: '代码已更新到最新版本', details: stdout });
      }
    });
  });
});

app.post('/api/update/install', (req, res) => {
  exec('npm install --production', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      res.json({ success: false, error: stderr || error.message });
      return;
    }
    res.json({ success: true, message: '依赖安装完成' });
  });
});

app.post('/api/update/database', (req, res) => {
  // Run database migration (create table if not exists)
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_type TEXT NOT NULL DEFAULT 'app' CHECK(app_type IN ('app', 'miniprogram')),
    app_name TEXT,
    team_or_institution TEXT,
    app_market TEXT,
    app_license_number TEXT,
    icp_license_number TEXT,
    education_filing TEXT,
    miniprogram_name TEXT,
    miniprogram_institution TEXT,
    miniprogram_platform TEXT,
    miniprogram_function TEXT,
    development_status TEXT,
    deployment_location TEXT,
    backend_domain TEXT,
    product_owner TEXT,
    dev_owner TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'launched' CHECK(status IN ('developing', 'launched', 'offline', 'paused')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({ success: true, message: '数据库结构已同步' });
    }
  });
});

app.post('/api/update/restart', (req, res) => {
  const usePM2 = process.env.npm_config_user_agent?.includes('pm2') || 
                 process.env.PM2_HOME !== undefined ||
                 fs.existsSync('ecosystem.config.js') ||
                 fs.existsSync('process.json');
  
  res.json({ 
    success: true, 
    message: usePM2 ? '正在通过 PM2 重启服务' : '服务即将重启（需配置进程守护）',
    usingPM2: usePM2
  });
  
  setTimeout(() => {
    if (usePM2) {
      // PM2 will auto-restart
      process.exit(0);
    } else {
      // Try to restart via pm2 CLI if available
      const { exec } = require('child_process');
      exec('pm2 restart all', (err) => {
        if (!err) {
          process.exit(0);
        } else {
          // Fallback: just exit, hope systemd or similar will restart
          process.exit(0);
        }
      });
    }
  }, 1000);
});

// Auto-kill old process on the same port before starting
function killPortAndStart() {
  const { execSync } = require('child_process');
  try {
    const pids = execSync(`lsof -ti:${PORT} 2>/dev/null`).toString().trim();
    if (pids && pids !== String(process.pid)) {
      console.log(`\u2139\uFE0F  端口 ${PORT} 被占用，正在强制释放 (PID: ${pids})...`);
      // Kill all processes on this port
      execSync(`kill -9 ${pids} 2>/dev/null || true`);
      // Wait for port to be released
      const maxWait = 3000;
      const startTime = Date.now();
      while (Date.now() - startTime < maxWait) {
        try {
          const stillOccupied = execSync(`lsof -ti:${PORT} 2>/dev/null`).toString().trim();
          if (!stillOccupied || stillOccupied === String(process.pid)) break;
        } catch(e) {
          break;
        }
      }
      console.log('\u2705 端口已释放');
    }
  } catch(e) {
    // Ignore errors, try to start anyway
  }
  startServer();
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`\u2705 系统已启动: http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\u274C 端口 ${PORT} 仍被占用，请手动执行: kill -9 $(lsof -ti:${PORT})`);
      process.exit(1);
    }
  });
}

killPortAndStart();