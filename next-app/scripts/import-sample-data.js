#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase 配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0';

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
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
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
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

// 导入示例数据
const importSampleData = async () => {
  try {
    console.log('🚀 开始导入示例数据...');
    
    // 读取示例数据
    const dataPath = path.join(__dirname, 'tools-0622.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const tools = JSON.parse(rawData);
    
    console.log(`📊 找到 ${tools.length} 个工具`);
    
    // 提取所有分类
    const categories = [...new Set(tools.map(tool => tool.catelog))].filter(Boolean);
    console.log(`📋 找到 ${categories.length} 个分类: ${categories.join(', ')}`);
    
    // 1. 先创建分类
    console.log('\n📋 创建分类...');
    const categoryMap = {};
    
    for (let i = 0; i < categories.length; i++) {
      const categoryName = categories[i];
      const categoryData = {
        name: categoryName,
        sort: i + 1,
        hide: false
      };
      
      const response = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'POST',
        body: categoryData,
        headers: {
          'Prefer': 'return=representation'
        }
      });
      
      if (response.status === 201) {
        const createdCategory = response.data[0];
        categoryMap[categoryName] = createdCategory.id;
        console.log(`✅ 创建分类: ${categoryName} (ID: ${createdCategory.id})`);
      } else {
        console.error(`❌ 创建分类失败: ${categoryName}`, response);
      }
    }
    
    // 2. 创建工具
    console.log('\n🔧 创建工具...');
    let successCount = 0;
    let failCount = 0;
    
    for (const tool of tools) {
      const toolData = {
        name: tool.name,
        url: tool.url,
        logo: tool.logo,
        description: tool.desc || '',
        catelog: categoryMap[tool.catelog] || 1,
        sort: tool.sort || 0,
        hide: tool.hide || false
      };
      
      const response = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
        method: 'POST',
        body: toolData
      });
      
      if (response.status === 201) {
        successCount++;
        console.log(`✅ 创建工具: ${tool.name}`);
      } else {
        failCount++;
        console.error(`❌ 创建工具失败: ${tool.name}`, response);
      }
    }
    
    // 3. 创建基本设置
    console.log('\n⚙️ 创建基本设置...');
    const settingData = {
      title: '导航工具',
      favicon: '/favicon.ico'
    };
    
    const settingResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_setting`, {
      method: 'POST',
      body: settingData
    });
    
    if (settingResponse.status === 201) {
      console.log('✅ 创建基本设置成功');
    } else {
      console.error('❌ 创建基本设置失败', settingResponse);
    }
    
    console.log('\n🎉 数据导入完成!');
    console.log(`✅ 成功创建 ${categories.length} 个分类`);
    console.log(`✅ 成功创建 ${successCount} 个工具`);
    if (failCount > 0) {
      console.log(`❌ 失败 ${failCount} 个工具`);
    }
    
  } catch (error) {
    console.error('❌ 导入数据时发生错误:', error);
    process.exit(1);
  }
};

// 执行导入
if (require.main === module) {
  importSampleData();
}

module.exports = { importSampleData };