#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

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

// 重置所有ID的主函数
const resetAllIds = async () => {
  try {
    console.log('🔄 开始重置所有数据ID...');
    
    // 1. 获取所有分类数据
    console.log('📋 获取所有分类数据...');
    const categories = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*&order=id.asc`);
    console.log(`找到 ${categories.length} 个分类`);
    
    // 2. 获取所有工具数据
    console.log('🔧 获取所有工具数据...');
    const tools = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?select=*&order=id.asc`);
    console.log(`找到 ${tools.length} 个工具`);
    
    // 3. 删除所有现有数据
    console.log('🗑️ 清空现有数据...');
    
    // 删除所有工具
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
      method: 'DELETE',
      headers: {
        'Prefer': 'return=minimal'
      }
    });
    
    // 删除所有分类
    await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
      method: 'DELETE',
      headers: {
        'Prefer': 'return=minimal'
      }
    });
    
    console.log('✅ 数据清空完成');
    
    // 4. 重新插入分类数据（ID将自动从1开始）
    console.log('📝 重新插入分类数据...');
    const newCategories = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const newCategory = {
        name: category.name,
        sort: i + 1,
        hide: category.hide || false
      };
      
      const insertedCategory = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: newCategory
      });
      
      newCategories.push({
        oldId: category.id,
        newId: insertedCategory[0].id,
        name: category.name
      });
      
      console.log(`✅ 分类 "${category.name}" 重置: ${category.id} → ${insertedCategory[0].id}`);
    }
    
    // 5. 创建ID映射表
    const categoryIdMap = {};
    newCategories.forEach(cat => {
      categoryIdMap[cat.oldId] = cat.newId;
    });
    
    // 6. 重新插入工具数据（更新分类ID引用）
    console.log('🔧 重新插入工具数据...');
    
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const newTool = {
        name: tool.name,
        url: tool.url,
        description: tool.description,
        icon: tool.icon,
        catelog_id: categoryIdMap[tool.catelog_id] || tool.catelog_id,
        sort: i + 1,
        hide: tool.hide || false,
        created_at: tool.created_at,
        updated_at: new Date().toISOString()
      };
      
      const insertedTool = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: newTool
      });
      
      console.log(`✅ 工具 "${tool.name}" 重置: ${tool.id} → ${insertedTool[0].id}`);
    }
    
    // 7. 重置序列（如果数据库支持）
    console.log('🔄 重置序列...');
    
    try {
      // 重置分类表序列
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/reset_sequence`, {
        method: 'POST',
        body: {
          table_name: 'nav_catelog',
          sequence_name: 'nav_catelog_id_seq'
        }
      });
      
      // 重置工具表序列
      await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/reset_sequence`, {
        method: 'POST',
        body: {
          table_name: 'nav_table',
          sequence_name: 'nav_table_id_seq'
        }
      });
      
      console.log('✅ 序列重置完成');
    } catch (error) {
      console.log('⚠️ 序列重置跳过（可能不支持）');
    }
    
    // 8. 验证结果
    console.log('\n🔍 验证重置结果...');
    
    const newCategoriesCheck = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*&order=id.asc`);
    const newToolsCheck = await makeRequest(`${SUPABASE_URL}/rest/v1/nav_table?select=*&order=id.asc`);
    
    console.log('\n📊 重置结果统计:');
    console.log(`分类数量: ${newCategoriesCheck.length}`);
    console.log(`工具数量: ${newToolsCheck.length}`);
    
    console.log('\n🆔 新的ID范围:');
    if (newCategoriesCheck.length > 0) {
      console.log(`分类ID: ${newCategoriesCheck[0].id} - ${newCategoriesCheck[newCategoriesCheck.length - 1].id}`);
    }
    if (newToolsCheck.length > 0) {
      console.log(`工具ID: ${newToolsCheck[0].id} - ${newToolsCheck[newToolsCheck.length - 1].id}`);
    }
    
    console.log('\n✅ 所有数据ID重置完成！');
    console.log('\n📝 ID映射记录:');
    newCategories.forEach(cat => {
      console.log(`  分类 "${cat.name}": ${cat.oldId} → ${cat.newId}`);
    });
    
    console.log('\n🎉 数据库ID重置成功！所有ID现在从1开始连续排列。');
    
  } catch (error) {
    console.error('❌ 重置ID时发生错误:', error);
    process.exit(1);
  }
};

// 执行重置
if (require.main === module) {
  resetAllIds();
}

module.exports = { resetAllIds };