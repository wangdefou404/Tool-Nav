import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const POST = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const tools = await request.json()
    
    if (!Array.isArray(tools)) {
      return Response.json(
        { success: false, errorMessage: '工具数据格式错误，请确保数据是数组格式' },
        { status: 400 }
      )
    }
    
    if (tools.length === 0) {
      return Response.json(
        { success: false, errorMessage: '工具数据为空' },
        { status: 400 }
      )
    }
    
    console.log('开始导入工具，数量：', tools.length)
    
    // 验证必填字段
    const invalidTools = tools.filter(tool => !tool.name || !tool.url)
    if (invalidTools.length > 0) {
      return Response.json(
        { success: false, errorMessage: `发现 ${invalidTools.length} 个工具缺少必填字段（name 或 url）` },
        { status: 400 }
      )
    }
    
    let insertedCount = 0
    const errors = []
    
    // 先获取现有分类
    const { data: existingCatelogs } = await supabase
      .from('nav_catelog')
      .select('id, name')
    
    const catelogMap = new Map()
    if (existingCatelogs) {
      existingCatelogs.forEach(cat => {
        catelogMap.set(cat.name, cat.id)
      })
    }
    
    // 收集需要创建的新分类
    const newCatelogs = new Set()
    tools.forEach(tool => {
      const catelogName = tool.catelog || tool.category || '默认分类'
      if (!catelogMap.has(catelogName)) {
        newCatelogs.add(catelogName)
      }
    })
    
    // 创建新分类
    if (newCatelogs.size > 0) {
      const catelogsToInsert = Array.from(newCatelogs).map((name, index) => ({
        name,
        sort: (existingCatelogs?.length || 0) + index + 1,
        hide: false
      }))
      
      const { data: newCatelogData, error: newCatelogError } = await supabase
        .from('nav_catelog')
        .insert(catelogsToInsert)
        .select()
      
      if (newCatelogError) {
        console.error('创建分类失败：', newCatelogError)
      } else if (newCatelogData) {
        newCatelogData.forEach(cat => {
          catelogMap.set(cat.name, cat.id)
        })
      }
    }
    
    // 批量插入工具
    const toolsToInsert = tools.map((tool, index) => {
      const catelogName = tool.catelog || tool.category || '默认分类'
      const catelogId = catelogMap.get(catelogName) || 1
      
      return {
        name: tool.name,
        url: tool.url,
        logo: tool.logo || '',
        catelog: catelogId,
        description: tool.desc || tool.description || '',
        sort: tool.sort || index + 1,
        hide: tool.hide || false
      }
    })
    
    // 分批插入，每次插入10个
    const batchSize = 10
    for (let i = 0; i < toolsToInsert.length; i += batchSize) {
      const batch = toolsToInsert.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabase
          .from('nav_table')
          .insert(batch)
          .select()
        
        if (error) {
          console.error('插入工具失败：', error)
          errors.push(`批次 ${Math.floor(i/batchSize) + 1}: ${error.message}`)
        } else {
          insertedCount += data?.length || 0
          console.log(`成功插入批次 ${Math.floor(i/batchSize) + 1}，数量：${data?.length || 0}`)
        }
      } catch (err) {
        console.error('批次插入异常：', err)
        const errorMessage = err instanceof Error ? err.message : '未知错误'
        errors.push(`批次 ${Math.floor(i/batchSize) + 1}: ${errorMessage}`)
      }
    }
    
    if (insertedCount === 0) {
      return Response.json(
        { 
          success: false, 
          errorMessage: '没有成功导入任何工具',
          errors: errors
        },
        { status: 500 }
      )
    }
    
    return Response.json({
      success: true,
      message: `成功导入 ${insertedCount} 个工具${errors.length > 0 ? `，${errors.length} 个批次失败` : ''}`,
      data: {
        importedCount: insertedCount,
        totalCount: tools.length,
        createdCatelogs: newCatelogs.size,
        errors: errors
      }
    })
    
  } catch (error) {
    console.error('Import tools error:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    
    return Response.json(
      { 
        success: false, 
        errorMessage: `导入失败：${errorMessage}` 
      },
      { status: 500 }
    )
  }
})