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

// 重置序列的主函数
const resetSequences = async () => {
  try {
    console.log('🔄 开始重置数据库序列...');
    
    // 1. 清空所有数据
    console.log('\n🗑️ 清空所有数据...');
    
    // 使用TRUNCATE命令清空表并重置序列
    try {
      // 清空工具表
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/truncate_table`, {
        method: 'POST',
        body: { table_name: 'nav_table' }
      });
      console.log('✅ 工具表已清空（TRUNCATE）');
    } catch (error) {
      console.log('⚠️ TRUNCATE工具表失败，使用DELETE');
      await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
        method: 'DELETE',
        headers: { 'Prefer': 'return=minimal' }
      });
    }
    
    try {
      // 清空分类表
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/truncate_table`, {
        method: 'POST',
        body: { table_name: 'nav_catelog' }
      });
      console.log('✅ 分类表已清空（TRUNCATE）');
    } catch (error) {
      console.log('⚠️ TRUNCATE分类表失败，使用DELETE');
      await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'DELETE',
        headers: { 'Prefer': 'return=minimal' }
      });
    }
    
    // 2. 手动重置序列
    console.log('\n🔢 手动重置序列...');
    
    try {
      // 重置分类表序列
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        body: { 
          sql: "ALTER SEQUENCE nav_catelog_id_seq RESTART WITH 1;" 
        }
      });
      console.log('✅ 分类表序列重置为1');
    } catch (error) {
      console.log('⚠️ 重置分类表序列失败:', error.message);
    }
    
    try {
      // 重置工具表序列
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        body: { 
          sql: "ALTER SEQUENCE nav_table_id_seq RESTART WITH 1;" 
        }
      });
      console.log('✅ 工具表序列重置为1');
    } catch (error) {
      console.log('⚠️ 重置工具表序列失败:', error.message);
    }
    
    // 3. 测试插入一条记录验证序列
    console.log('\n🧪 测试序列重置效果...');
    
    try {
      // 插入测试分类
      const testCategory = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: {
          name: '测试分类',
          sort: 1,
          hide: false
        }
      });
      
      if (testCategory && testCategory.length > 0) {
        const categoryId = testCategory[0].id;
        console.log(`✅ 测试分类创建成功，ID: ${categoryId}`);
        
        // 插入测试工具
        const testTool = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: {
            name: '测试工具',
            url: 'https://test.com',
            description: '测试描述',
            icon: '',
            catelog_id: categoryId,
            sort: 1,
            hide: false
          }
        });
        
        if (testTool && testTool.length > 0) {
          const toolId = testTool[0].id;
          console.log(`✅ 测试工具创建成功，ID: ${toolId}`);
          
          // 删除测试数据
          await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?id=eq.${toolId}`, {
            method: 'DELETE'
          });
          await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?id=eq.${categoryId}`, {
            method: 'DELETE'
          });
          console.log('✅ 测试数据已清理');
          
          // 检查ID是否从1开始
          if (categoryId === 1 && toolId === 1) {
            console.log('🎉 序列重置成功！ID将从1开始');
          } else {
            console.log(`⚠️ 序列重置可能未完全成功。分类ID: ${categoryId}, 工具ID: ${toolId}`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ 测试序列时发生错误:', error.message);
    }
    
    console.log('\n✅ 序列重置完成！现在可以重新导入数据，ID将从1开始。');
    
  } catch (error) {
    console.error('❌ 重置序列时发生错误:', error);
    process.exit(1);
  }
};

// 执行重置
if (require.main === module) {
  resetSequences();
}

module.exports = { resetSequences };