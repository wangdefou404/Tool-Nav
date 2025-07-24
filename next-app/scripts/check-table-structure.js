#!/usr/bin/env node

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

// 检查表结构
const checkTableStructure = async () => {
  try {
    console.log('🔍 检查数据库表结构...');
    
    // 尝试插入一个测试记录来了解字段结构
    console.log('\n📋 测试 nav_catelog 表结构:');
    const testCategory = {
      name: 'test_category',
      sort: 1,
      hide: false
    };
    
    const categoryResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
      method: 'POST',
      body: testCategory,
      headers: {
        'Prefer': 'return=representation'
      }
    });
    
    if (categoryResponse.status === 201) {
      console.log('✅ nav_catelog 表字段正确:', Object.keys(categoryResponse.data[0]));
      
      // 删除测试记录
      const deleteResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?id=eq.${categoryResponse.data[0].id}`, {
        method: 'DELETE'
      });
    } else {
      console.log('❌ nav_catelog 表字段错误:', categoryResponse.data);
    }
    
    console.log('\n🔧 测试 nav_table 表结构:');
    // 尝试不同的字段组合
    const testFields = [
      { name: 'test_tool', url: 'https://test.com' },
      { name: 'test_tool', url: 'https://test.com', description: 'test desc' },
      { name: 'test_tool', url: 'https://test.com', desc: 'test desc' },
      { name: 'test_tool', url: 'https://test.com', logo: 'test.png', catelog: 'test', sort: 1, hide: false }
    ];
    
    for (let i = 0; i < testFields.length; i++) {
      const testTool = testFields[i];
      console.log(`\n测试字段组合 ${i + 1}:`, Object.keys(testTool));
      
      const toolResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
        method: 'POST',
        body: testTool,
        headers: {
          'Prefer': 'return=representation'
        }
      });
      
      if (toolResponse.status === 201) {
        console.log('✅ 成功! nav_table 表字段:', Object.keys(toolResponse.data[0]));
        
        // 删除测试记录
        await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?id=eq.${toolResponse.data[0].id}`, {
          method: 'DELETE'
        });
        break;
      } else {
        console.log('❌ 失败:', toolResponse.data.message || toolResponse.data);
      }
    }
    
    console.log('\n⚙️ 测试 nav_setting 表结构:');
    const testSetting = {
      title: 'test_title'
    };
    
    const settingResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_setting`, {
      method: 'POST',
      body: testSetting,
      headers: {
        'Prefer': 'return=representation'
      }
    });
    
    if (settingResponse.status === 201) {
      console.log('✅ nav_setting 表字段正确:', Object.keys(settingResponse.data[0]));
      
      // 删除测试记录
      await makeRequest(`${SUPABASE_URL}/rest/v1/nav_setting?id=eq.${settingResponse.data[0].id}`, {
        method: 'DELETE'
      });
    } else {
      console.log('❌ nav_setting 表字段错误:', settingResponse.data);
    }
    
  } catch (error) {
    console.error('❌ 检查表结构时发生错误:', error);
  }
};

// 执行检查
if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure };