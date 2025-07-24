#!/usr/bin/env node

// Supabase 配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0';

// 导入 fetch (Node.js 18+)
const fetch = globalThis.fetch || require('node-fetch');

// HTTP 请求辅助函数
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    return { status: response.status, data };
  } catch (error) {
    throw error;
  }
};

// 清空所有数据的主函数
const clearAllData = async () => {
  try {
    console.log('🗑️  开始清空所有数据...');
    
    // 1. 删除所有工具数据
    console.log('\n📋 删除所有工具数据...');
    const deleteToolsResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_table?id=gte.1`,
      {
        method: 'DELETE',
        headers: {
          'Prefer': 'return=minimal'
        }
      }
    );
    
    if (deleteToolsResponse.status >= 200 && deleteToolsResponse.status < 300) {
      console.log('✅ 工具数据删除成功');
    } else {
      console.log('❌ 工具数据删除失败:', deleteToolsResponse.data);
    }
    
    // 2. 删除所有分类数据
    console.log('\n📂 删除所有分类数据...');
    const deleteCategoriesResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_catelog?id=gte.1`,
      {
        method: 'DELETE',
        headers: {
          'Prefer': 'return=minimal'
        }
      }
    );
    
    if (deleteCategoriesResponse.status >= 200 && deleteCategoriesResponse.status < 300) {
      console.log('✅ 分类数据删除成功');
    } else {
      console.log('❌ 分类数据删除失败:', deleteCategoriesResponse.data);
    }
    
    // 3. 重置序列从1开始
    console.log('\n🔄 重置ID序列...');
    
    // 重置工具表序列
    try {
      const resetToolsSeqResponse = await makeRequest(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          body: {
            sql: "ALTER SEQUENCE nav_table_id_seq RESTART WITH 1;"
          }
        }
      );
      console.log('✅ 工具表序列重置成功');
    } catch (error) {
      console.log('⚠️  工具表序列重置失败，但不影响数据清空');
    }
    
    // 重置分类表序列
    try {
      const resetCategoriesSeqResponse = await makeRequest(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          body: {
            sql: "ALTER SEQUENCE nav_catelog_id_seq RESTART WITH 1;"
          }
        }
      );
      console.log('✅ 分类表序列重置成功');
    } catch (error) {
      console.log('⚠️  分类表序列重置失败，但不影响数据清空');
    }
    
    console.log('✅ ID序列重置完成');
    
    // 4. 验证清空结果
    console.log('\n🔍 验证清空结果...');
    
    const toolsCountResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_table?select=id`
    );
    
    const categoriesCountResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_catelog?select=id`
    );
    
    console.log('\n📊 清空结果统计:');
    console.log(`- 工具数量: ${toolsCountResponse.data?.length || 0}`);
    console.log(`- 分类数量: ${categoriesCountResponse.data?.length || 0}`);
    
    console.log('\n✅ 数据库清空完成！');
    console.log('\n📝 下一步操作:');
    console.log('1. 数据库已完全清空');
    console.log('2. ID序列已重置为从1开始');
    console.log('3. 现在可以重新上传您的数据');
    console.log('4. 新数据的ID将从1开始连续编号');
    
  } catch (error) {
    console.error('❌ 清空数据时发生错误:', error);
    process.exit(1);
  }
};

// 执行清空操作
clearAllData();