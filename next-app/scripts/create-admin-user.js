#!/usr/bin/env node

// Supabase 配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0';

// 导入 fetch (Node.js 18+)
const fetch = globalThis.fetch || require('node-fetch');
const bcrypt = require('bcryptjs');

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

// 创建管理员用户的主函数
const createAdminUser = async () => {
  try {
    console.log('🔍 检查管理员用户是否存在...');
    
    // 1. 检查是否已存在管理员用户
    const checkUserResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_user?username=eq.admin`
    );
    
    if (checkUserResponse.status === 200 && checkUserResponse.data.length > 0) {
      console.log('✅ 管理员用户已存在');
      console.log('用户信息:', checkUserResponse.data[0]);
      return;
    }
    
    console.log('📝 创建默认管理员用户...');
    
    // 2. 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // 3. 创建管理员用户
    const createUserResponse = await makeRequest(
      `${SUPABASE_URL}/rest/v1/nav_user`,
      {
        method: 'POST',
        body: {
          username: 'admin',
          password: hashedPassword
        },
        headers: {
          'Prefer': 'return=representation'
        }
      }
    );
    
    if (createUserResponse.status >= 200 && createUserResponse.status < 300) {
      console.log('✅ 管理员用户创建成功');
      console.log('用户名: admin');
      console.log('密码: admin123');
      console.log('⚠️  请在首次登录后修改默认密码！');
    } else {
      console.log('❌ 管理员用户创建失败:', createUserResponse.data);
    }
    
  } catch (error) {
    console.error('❌ 创建管理员用户时发生错误:', error);
    process.exit(1);
  }
};

// 执行创建操作
createAdminUser();