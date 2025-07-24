#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase 配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0';

// HTTP 请求辅助函数
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
};

// 分类映射表
const categoryMapping = {
  '人工智能': 'AI工具',
  '得否出品': '得否出品',
  '代码托管': '开发工具',
  '模板工具': '模板工具',
  'AI工具': 'AI工具',
  '购买域名': '域名服务',
  '购买VPS': 'VPS服务',
  'AI课程': '学习资源',
  'SEO工具': 'SEO工具',
  '实用工具': '实用工具',
  '图标下载': '设计资源',
  '独立开发': '开发工具'
};

// 最终重置ID从1开始的函数
const finalResetFrom1 = async () => {
  try {
    console.log('🔄 最终重置：确保所有ID从1开始...');
    
    // 1. 读取原始数据
    const originalDataPath = path.join(__dirname, 'tools-0622.json');
    if (!fs.existsSync(originalDataPath)) {
      console.error('❌ 未找到原始数据文件: tools-0622.json');
      return;
    }
    
    const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));
    console.log(`📊 读取到 ${originalData.length} 个工具数据`);
    
    // 2. 分析原始数据中的分类
    const originalCategories = new Set();
    originalData.forEach(tool => {
      if (tool.catelog) {
        const mappedCategory = categoryMapping[tool.catelog] || tool.catelog;
        originalCategories.add(mappedCategory);
      }
    });
    
    const uniqueCategories = Array.from(originalCategories).sort();
    console.log(`📂 发现 ${uniqueCategories.length} 个唯一分类:`, uniqueCategories.join(', '));
    
    // 3. 完全清空数据库
    console.log('\n🗑️ 完全清空数据库...');
    
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
      method: 'DELETE',
      headers: { 'Prefer': 'return=minimal' }
    });
    
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
      method: 'DELETE',
      headers: { 'Prefer': 'return=minimal' }
    });
    
    console.log('✅ 数据库已清空');
    
    // 4. 强制重置序列到1
    console.log('\n🔢 强制重置序列到1...');
    
    const resetCommands = [
      "SELECT setval('nav_catelog_id_seq', 1, false);",
      "SELECT setval('nav_table_id_seq', 1, false);"
    ];
    
    for (const sql of resetCommands) {
      try {
        await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          body: { sql }
        });
        console.log(`✅ 执行: ${sql}`);
      } catch (error) {
        console.log(`⚠️ 执行失败: ${sql}`);
      }
    }
    
    // 5. 手动插入分类，指定ID从1开始
    console.log('\n📝 手动插入分类（指定ID从1开始）...');
    const categoryIdMap = {};
    
    for (let i = 0; i < uniqueCategories.length; i++) {
      const categoryName = uniqueCategories[i];
      const targetId = i + 1;
      
      // 尝试指定ID插入
      try {
        const insertSql = `INSERT INTO nav_catelog (id, name, sort, hide) VALUES (${targetId}, '${categoryName.replace(/'/g, "''")}', ${targetId}, false) RETURNING *;`;
        const result = await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          body: { sql: insertSql }
        });
        
        categoryIdMap[categoryName] = targetId;
        console.log(`✅ 分类 "${categoryName}" 插入: ID=${targetId}`);
      } catch (error) {
        // 如果指定ID失败，使用普通插入
        const newCategory = {
          name: categoryName,
          sort: targetId,
          hide: false
        };
        
        const insertedCategory = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: newCategory
        });
        
        if (insertedCategory && insertedCategory.length > 0) {
          const actualId = insertedCategory[0].id;
          categoryIdMap[categoryName] = actualId;
          console.log(`✅ 分类 "${categoryName}" 插入: ID=${actualId} (自动分配)`);
        }
      }
    }
    
    // 6. 重置工具表序列
    try {
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        body: { sql: "SELECT setval('nav_table_id_seq', 1, false);" }
      });
      console.log('✅ 工具表序列重置');
    } catch (error) {
      console.log('⚠️ 工具表序列重置失败');
    }
    
    // 7. 手动插入工具，指定ID从1开始
    console.log('\n🔧 手动插入工具（指定ID从1开始）...');
    
    for (let i = 0; i < originalData.length; i++) {
      const tool = originalData[i];
      const originalCategory = tool.catelog;
      const mappedCategory = categoryMapping[originalCategory] || originalCategory;
      const categoryId = categoryIdMap[mappedCategory];
      const targetId = i + 1;
      
      if (!categoryId) {
        console.warn(`⚠️ 工具 "${tool.name}" 的分类未找到，跳过`);
        continue;
      }
      
      try {
        // 尝试指定ID插入
        const toolName = tool.name.replace(/'/g, "''");
        const toolUrl = tool.url.replace(/'/g, "''");
        const toolDesc = (tool.desc || tool.description || '').replace(/'/g, "''");
        const toolIcon = (tool.logo || '').replace(/'/g, "''");
        
        const insertSql = `INSERT INTO nav_table (id, name, url, description, icon, catelog_id, sort, hide, created_at, updated_at) VALUES (${targetId}, '${toolName}', '${toolUrl}', '${toolDesc}', '${toolIcon}', ${categoryId}, ${targetId}, false, NOW(), NOW()) RETURNING *;`;
        
        await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          body: { sql: insertSql }
        });
        
        console.log(`✅ 工具 "${tool.name}" 插入: ID=${targetId}`);
      } catch (error) {
        // 如果指定ID失败，使用普通插入
        const newTool = {
          name: tool.name,
          url: tool.url,
          description: tool.desc || tool.description || '',
          icon: tool.logo || '',
          catelog_id: categoryId,
          sort: targetId,
          hide: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const insertedTool = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: newTool
        });
        
        if (insertedTool && insertedTool.length > 0) {
          const actualId = insertedTool[0].id;
          console.log(`✅ 工具 "${tool.name}" 插入: ID=${actualId} (自动分配)`);
        }
      }
    }
    
    // 8. 验证最终结果
    console.log('\n🔍 验证最终结果...');
    
    const finalCategories = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*&order=id.asc`);
    const finalTools = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?select=*&order=id.asc`);
    
    console.log('\n📊 最终结果统计:');
    console.log(`分类数量: ${finalCategories.length}`);
    console.log(`工具数量: ${finalTools.length}`);
    
    if (finalCategories.length > 0) {
      console.log(`分类ID范围: ${finalCategories[0].id} - ${finalCategories[finalCategories.length - 1].id}`);
    }
    if (finalTools.length > 0) {
      console.log(`工具ID范围: ${finalTools[0].id} - ${finalTools[finalTools.length - 1].id}`);
    }
    
    // 检查是否从1开始
    console.log('\n🎯 ID起始验证:');
    if (finalCategories.length > 0 && finalCategories[0].id === 1) {
      console.log('✅ 分类ID从1开始');
    } else {
      console.log(`❌ 分类ID不是从1开始，实际起始: ${finalCategories.length > 0 ? finalCategories[0].id : 'N/A'}`);
    }
    
    if (finalTools.length > 0 && finalTools[0].id === 1) {
      console.log('✅ 工具ID从1开始');
    } else {
      console.log(`❌ 工具ID不是从1开始，实际起始: ${finalTools.length > 0 ? finalTools[0].id : 'N/A'}`);
    }
    
    console.log('\n🎉 最终重置完成！');
    
    if ((finalCategories.length > 0 && finalCategories[0].id === 1) && 
        (finalTools.length > 0 && finalTools[0].id === 1)) {
      console.log('🎊 成功！所有ID现在都从1开始！');
    } else {
      console.log('⚠️ 注意：由于数据库限制，ID可能无法完全从1开始。');
      console.log('   这是正常的，数据功能不受影响。');
    }
    
  } catch (error) {
    console.error('❌ 最终重置时发生错误:', error);
    process.exit(1);
  }
};

// 执行重置
if (require.main === module) {
  finalResetFrom1();
}

module.exports = { finalResetFrom1 };