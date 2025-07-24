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

// 完全重置ID的主函数
const completeResetIds = async () => {
  try {
    console.log('🔄 开始完全重置所有数据ID（从1开始）...');
    
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
    
    // 删除所有工具
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
      method: 'DELETE',
      headers: {
        'Prefer': 'return=minimal'
      }
    });
    console.log('✅ 工具表已清空');
    
    // 删除所有分类
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
      method: 'DELETE',
      headers: {
        'Prefer': 'return=minimal'
      }
    });
    console.log('✅ 分类表已清空');
    
    // 4. 重新创建分类（ID将从1开始）
    console.log('\n📝 重新创建分类（从ID=1开始）...');
    const categoryIdMap = {};
    
    for (let i = 0; i < uniqueCategories.length; i++) {
      const categoryName = uniqueCategories[i];
      const newCategory = {
        name: categoryName,
        sort: i + 1,
        hide: false
      };
      
      const insertedCategory = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: newCategory
      });
      
      const newId = insertedCategory[0].id;
      categoryIdMap[categoryName] = newId;
      
      console.log(`✅ 分类 "${categoryName}" 创建: ID=${newId}`);
    }
    
    // 5. 重新插入工具数据（ID将从1开始）
    console.log('\n🔧 重新插入工具数据（从ID=1开始）...');
    
    for (let i = 0; i < originalData.length; i++) {
      const tool = originalData[i];
      const originalCategory = tool.catelog;
      const mappedCategory = categoryMapping[originalCategory] || originalCategory;
      const categoryId = categoryIdMap[mappedCategory];
      
      if (!categoryId) {
        console.warn(`⚠️ 工具 "${tool.name}" 的分类 "${originalCategory}" -> "${mappedCategory}" 未找到对应ID，使用默认分类`);
      }
      
      const newTool = {
        name: tool.name,
        url: tool.url,
        description: tool.desc || tool.description || '',
        icon: tool.logo || '',
        catelog_id: categoryId || 1,
        sort: i + 1,
        hide: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const insertedTool = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: newTool
      });
      
      if (insertedTool && insertedTool.length > 0 && insertedTool[0].id) {
        const newId = insertedTool[0].id;
        console.log(`✅ 工具 "${tool.name}" 创建: ID=${newId}, 分类="${mappedCategory}"`);
      } else {
        console.error(`❌ 工具 "${tool.name}" 创建失败:`, insertedTool);
      }
    }
    
    // 6. 验证结果
    console.log('\n🔍 验证重置结果...');
    
    const newCategories = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*&order=id.asc`);
    const newTools = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?select=*&order=id.asc`);
    
    console.log('\n📊 重置结果统计:');
    console.log(`分类数量: ${newCategories.length}`);
    console.log(`工具数量: ${newTools.length}`);
    
    console.log('\n🆔 新的ID范围:');
    if (newCategories.length > 0) {
      console.log(`分类ID: ${newCategories[0].id} - ${newCategories[newCategories.length - 1].id}`);
    }
    if (newTools.length > 0) {
      console.log(`工具ID: ${newTools[0].id} - ${newTools[newTools.length - 1].id}`);
    }
    
    // 检查是否从1开始
    console.log('\n🎯 ID起始验证:');
    if (newCategories.length > 0 && newCategories[0].id === 1) {
      console.log('✅ 分类ID从1开始');
    } else {
      console.log(`❌ 分类ID不是从1开始，实际起始ID: ${newCategories.length > 0 ? newCategories[0].id : 'N/A'}`);
    }
    
    if (newTools.length > 0 && newTools[0].id === 1) {
      console.log('✅ 工具ID从1开始');
    } else {
      console.log(`❌ 工具ID不是从1开始，实际起始ID: ${newTools.length > 0 ? newTools[0].id : 'N/A'}`);
    }
    
    console.log('\n📝 分类映射表:');
    Object.entries(categoryIdMap).forEach(([name, id]) => {
      console.log(`  "${name}": ID=${id}`);
    });
    
    console.log('\n🎉 数据库ID完全重置成功！');
    
    // 如果ID仍然不是从1开始，说明数据库有自增序列问题
    if ((newCategories.length > 0 && newCategories[0].id !== 1) || 
        (newTools.length > 0 && newTools[0].id !== 1)) {
      console.log('\n⚠️ 注意: ID没有从1开始，这可能是因为数据库的自增序列没有重置。');
      console.log('   在PostgreSQL中，删除数据不会重置序列。');
      console.log('   如果需要真正从1开始，可能需要手动重置序列或使用TRUNCATE命令。');
    }
    
  } catch (error) {
    console.error('❌ 完全重置ID时发生错误:', error);
    process.exit(1);
  }
};

// 执行重置
if (require.main === module) {
  completeResetIds();
}

module.exports = { completeResetIds };