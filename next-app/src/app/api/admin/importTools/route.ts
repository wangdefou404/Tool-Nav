import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

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
    
    // 验证必填字段
    const invalidTools = tools.filter(tool => !tool.name || !tool.url)
    if (invalidTools.length > 0) {
      return Response.json(
        { success: false, errorMessage: `发现 ${invalidTools.length} 个工具缺少必填字段（name 或 url）` },
        { status: 400 }
      )
    }
    
    // 获取所有现有分类
    const { data: existingCatelogs, error: catelogError } = await supabaseAdmin
      .from('nav_catelog')
      .select('id, name')
    
    if (catelogError) {
      throw catelogError
    }
    
    const catelogMap = new Map()
    existingCatelogs?.forEach(cat => {
      catelogMap.set(cat.name, cat.id)
    })
    
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
        sort: (existingCatelogs?.length || 0) + index + 1
      }))
      
      const { data: newCatelogData, error: newCatelogError } = await supabaseAdmin
        .from('nav_catelog')
        .insert(catelogsToInsert)
        .select()
      
      if (newCatelogError) {
        throw newCatelogError
      }
      
      // 更新分类映射
      newCatelogData?.forEach(cat => {
        catelogMap.set(cat.name, cat.id)
      })
    }
    
    // 准备工具数据
    const toolsToInsert = tools.map((tool, index) => {
      const catelogName = tool.catelog || tool.category || '默认分类'
      const catelogId = catelogMap.get(catelogName)
      
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
    
    // 批量插入工具数据
    const { data, error } = await supabaseAdmin
      .from('nav_table')
      .insert(toolsToInsert)
      .select()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: `成功导入 ${data?.length || 0} 个工具${newCatelogs.size > 0 ? `，创建了 ${newCatelogs.size} 个新分类` : ''}`,
      data: {
        importedTools: data?.length || 0,
        createdCatelogs: newCatelogs.size,
        tools: data
      }
    })
    
  } catch (error) {
    console.error('Import tools error:', error)
    
    // 提供更详细的错误信息
    let errorMessage = '导入工具失败'
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        errorMessage = '导入失败：存在重复的工具名称或URL'
      } else if (error.message.includes('foreign key')) {
        errorMessage = '导入失败：分类关联错误'
      } else {
        errorMessage = `导入失败：${error.message}`
      }
    }
    
    return Response.json(
      { success: false, errorMessage },
      { status: 500 }
    )
  }
})