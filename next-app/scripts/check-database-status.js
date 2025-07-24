#!/usr/bin/env node

const https = require('https');

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

// 检查数据库状态
const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 检查数据库当前状态...');
    
    // 获取分类数据
    console.log('\n📋 分类表状态:');
    const categories = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*&order=id.asc`);
    console.log(`总数量: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log(`ID范围: ${categories[0].id} - ${categories[categories.length - 1].id}`);
      console.log('前5个分类:');
      categories.slice(0, 5).forEach(cat => {
        console.log(`  ID: ${cat.id}, 名称: "${cat.name}", 排序: ${cat.sort}`);
      });
      
      if (categories.length > 5) {
        console.log('...');
        console.log('最后5个分类:');
        categories.slice(-5).forEach(cat => {
          console.log(`  ID: ${cat.id}, 名称: "${cat.name}", 排序: ${cat.sort}`);
        });
      }
    }
    
    // 获取工具数据
    console.log('\n🔧 工具表状态:');
    const tools = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?select=*&order=id.asc`);
    console.log(`总数量: ${tools.length}`);
    
    if (tools.length > 0) {
      console.log(`ID范围: ${tools[0].id} - ${tools[tools.length - 1].id}`);
      console.log('前5个工具:');
      tools.slice(0, 5).forEach(tool => {
        console.log(`  ID: ${tool.id}, 名称: "${tool.name}", 分类ID: ${tool.catelog_id}`);
      });
      
      if (tools.length > 5) {
        console.log('...');
        console.log('最后5个工具:');
        tools.slice(-5).forEach(tool => {
          console.log(`  ID: ${tool.id}, 名称: "${tool.name}", 分类ID: ${tool.catelog_id}`);
        });
      }
    }
    
    // 检查ID是否连续
    console.log('\n🔢 ID连续性检查:');
    
    // 检查分类ID连续性
    if (categories.length > 0) {
      const categoryIds = categories.map(cat => cat.id).sort((a, b) => a - b);
      const minCatId = categoryIds[0];
      const maxCatId = categoryIds[categoryIds.length - 1];
      const expectedCatIds = Array.from({length: maxCatId - minCatId + 1}, (_, i) => minCatId + i);
      const missingCatIds = expectedCatIds.filter(id => !categoryIds.includes(id));
      
      if (missingCatIds.length === 0) {
        console.log('✅ 分类ID连续');
      } else {
        console.log(`❌ 分类ID不连续，缺失: ${missingCatIds.join(', ')}`);
      }
    }
    
    // 检查工具ID连续性
    if (tools.length > 0) {
      const toolIds = tools.map(tool => tool.id).sort((a, b) => a - b);
      const minToolId = toolIds[0];
      const maxToolId = toolIds[toolIds.length - 1];
      const expectedToolIds = Array.from({length: maxToolId - minToolId + 1}, (_, i) => minToolId + i);
      const missingToolIds = expectedToolIds.filter(id => !toolIds.includes(id));
      
      if (missingToolIds.length === 0) {
        console.log('✅ 工具ID连续');
      } else {
        console.log(`❌ 工具ID不连续，缺失: ${missingToolIds.join(', ')}`);
      }
    }
    
    // 分析ID是否从1开始
    console.log('\n🎯 ID起始检查:');
    if (categories.length > 0 && categories[0].id === 1) {
      console.log('✅ 分类ID从1开始');
    } else {
      console.log(`❌ 分类ID不是从1开始，最小ID: ${categories.length > 0 ? categories[0].id : 'N/A'}`);
    }
    
    if (tools.length > 0 && tools[0].id === 1) {
      console.log('✅ 工具ID从1开始');
    } else {
      console.log(`❌ 工具ID不是从1开始，最小ID: ${tools.length > 0 ? tools[0].id : 'N/A'}`);
    }
    
    console.log('\n📊 数据库状态检查完成！');
    
  } catch (error) {
    console.error('❌ 检查数据库状态时发生错误:', error);
    process.exit(1);
  }
};

// 执行检查
if (require.main === module) {
  checkDatabaseStatus();
}

module.exports = { checkDatabaseStatus };