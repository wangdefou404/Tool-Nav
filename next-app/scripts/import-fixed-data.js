#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Supabase配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0'

async function importFixedData() {
  try {
    console.log('📥 开始导入修复后的数据...')
    
    // 1. 读取修复后的数据
    const dataPath = path.join(__dirname, 'converted-tools-fixed.json')
    if (!fs.existsSync(dataPath)) {
      console.error('❌ 未找到修复后的数据文件: converted-tools-fixed.json')
      console.log('请先运行: node scripts/fix-category-mapping.js')
      return
    }
    
    const toolsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    console.log(`📊 准备导入 ${toolsData.length} 个工具`)
    
    // 2. 清空现有数据（可选）
    console.log('\n🗑️  清空现有工具数据...')
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/nav_table`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!deleteResponse.ok) {
      console.warn('⚠️  清空数据失败，继续导入新数据')
    } else {
      console.log('✅ 现有数据已清空')
    }
    
    // 3. 批量导入数据
    console.log('\n📤 批量导入工具数据...')
    const batchSize = 10 // 每批导入10个
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < toolsData.length; i += batchSize) {
      const batch = toolsData.slice(i, i + batchSize)
      console.log(`导入第 ${Math.floor(i/batchSize) + 1} 批 (${i + 1}-${Math.min(i + batchSize, toolsData.length)})...`)
      
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/nav_table`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(batch)
        })
        
        if (response.ok) {
          successCount += batch.length
          console.log(`   ✅ 成功导入 ${batch.length} 个工具`)
        } else {
          const error = await response.text()
          console.error(`   ❌ 批次导入失败: ${error}`)
          errorCount += batch.length
        }
      } catch (error) {
        console.error(`   ❌ 批次导入异常: ${error.message}`)
        errorCount += batch.length
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 4. 验证导入结果
    console.log('\n🔍 验证导入结果...')
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/nav_table?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })
    
    if (verifyResponse.ok) {
      const countHeader = verifyResponse.headers.get('content-range')
      const totalCount = countHeader ? parseInt(countHeader.split('/')[1]) : 0
      console.log(`✅ 数据库中现有 ${totalCount} 个工具`)
    }
    
    // 5. 显示导入统计
    console.log('\n📊 导入统计:')
    console.log(`   ✅ 成功: ${successCount} 个工具`)
    console.log(`   ❌ 失败: ${errorCount} 个工具`)
    console.log(`   📊 总计: ${toolsData.length} 个工具`)
    
    if (successCount > 0) {
      console.log('\n🎉 数据导入完成！')
      console.log('\n📝 后续操作:')
      console.log('1. 访问管理界面检查数据: http://localhost:3001/admin')
      console.log('2. 检查分类是否正确显示')
      console.log('3. 验证工具链接和描述')
    } else {
      console.log('\n❌ 数据导入失败，请检查错误信息')
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  importFixedData()
}

module.exports = { importFixedData }