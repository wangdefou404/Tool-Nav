#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')
const { URL } = require('url')

// Supabase配置
const SUPABASE_URL = 'https://fmkekjlsfnvubnvurhbt.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0'

// HTTP请求辅助函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }
    
    const req = https.request(requestOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const result = {
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          }
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// 分类映射表：原始中文名称 -> 系统中的英文名称
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
}

async function fixCategoryMapping() {
  try {
    console.log('🔧 开始修复分类映射...')
    
    // 1. 读取原始数据
    const originalDataPath = path.join(__dirname, 'tools-0622.json')
    if (!fs.existsSync(originalDataPath)) {
      console.error('❌ 未找到原始数据文件: tools-0622.json')
      return
    }
    
    const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'))
    console.log(`📊 读取到 ${originalData.length} 个工具数据`)
    
    // 2. 获取当前数据库中的分类
    console.log('\n📋 获取当前分类列表...')
    const categoriesResponse = await fetch(`${SUPABASE_URL}/rest/v1/nav_catelog?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!categoriesResponse.ok) {
      throw new Error(`获取分类失败: ${categoriesResponse.statusText}`)
    }
    
    const existingCategories = await categoriesResponse.json()
    console.log('现有分类:', existingCategories.map(cat => `${cat.id}: ${cat.name}`).join(', '))
    
    // 3. 创建分类名称到ID的映射
    const categoryNameToId = {}
    existingCategories.forEach(cat => {
      categoryNameToId[cat.name] = cat.id
    })
    
    // 4. 分析原始数据中的分类
    const originalCategories = new Set()
    originalData.forEach(tool => {
      if (tool.catelog) {
        originalCategories.add(tool.catelog)
      }
    })
    
    console.log('\n📂 原始数据中的分类:')
    Array.from(originalCategories).forEach(cat => {
      const mappedName = categoryMapping[cat] || cat
      const categoryId = categoryNameToId[mappedName]
      console.log(`   - "${cat}" -> "${mappedName}" (ID: ${categoryId || '需要创建'})`)
    })
    
    // 5. 创建缺失的分类
    console.log('\n🆕 创建缺失的分类...')
    const categoriesToCreate = []
    let maxSort = Math.max(...existingCategories.map(cat => cat.sort || 0), 0)
    
    for (const originalCat of originalCategories) {
      const mappedName = categoryMapping[originalCat] || originalCat
      if (!categoryNameToId[mappedName]) {
        categoriesToCreate.push({
          name: mappedName,
          sort: ++maxSort,
          hide: false
        })
      }
    }
    
    if (categoriesToCreate.length > 0) {
      console.log(`创建 ${categoriesToCreate.length} 个新分类:`, categoriesToCreate.map(cat => cat.name).join(', '))
      
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/nav_catelog`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(categoriesToCreate)
      })
      
      if (!createResponse.ok) {
        const error = await createResponse.text()
        throw new Error(`创建分类失败: ${error}`)
      }
      
      const newCategories = await createResponse.json()
      newCategories.forEach(cat => {
        categoryNameToId[cat.name] = cat.id
      })
      
      console.log('✅ 新分类创建成功')
    } else {
      console.log('✅ 所有分类都已存在')
    }
    
    // 6. 转换数据格式
    console.log('\n🔄 转换数据格式...')
    const convertedData = originalData.map(tool => {
      const originalCategory = tool.catelog
      const mappedCategory = categoryMapping[originalCategory] || originalCategory
      const categoryId = categoryNameToId[mappedCategory]
      
      if (!categoryId) {
        console.warn(`⚠️  工具 "${tool.name}" 的分类 "${originalCategory}" -> "${mappedCategory}" 未找到对应ID`)
      }
      
      return {
        name: tool.name,
        url: tool.url,
        logo: tool.logo,
        catelog: categoryId || 1, // 默认分类ID
        description: tool.desc || tool.description || '',
        sort: tool.sort || 1,
        hide: tool.hide || false
      }
    })
    
    // 7. 保存转换后的数据
    const outputPath = path.join(__dirname, 'converted-tools-fixed.json')
    fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2))
    console.log(`\n💾 转换后的数据已保存到: ${outputPath}`)
    
    // 8. 显示统计信息
    console.log('\n📊 转换统计:')
    const categoryStats = {}
    convertedData.forEach(tool => {
      const categoryName = Object.keys(categoryNameToId).find(name => categoryNameToId[name] === tool.catelog) || '未知分类'
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1
    })
    
    Object.entries(categoryStats).forEach(([name, count]) => {
      console.log(`   - ${name}: ${count} 个工具`)
    })
    
    console.log('\n✅ 分类映射修复完成！')
    console.log('\n📝 下一步操作:')
    console.log('1. 检查转换后的数据: converted-tools-fixed.json')
    console.log('2. 使用修复后的数据导入: node scripts/import-fixed-data.js')
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  fixCategoryMapping()
}

module.exports = { fixCategoryMapping, categoryMapping }