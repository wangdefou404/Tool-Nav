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
    
    console.log('开始导入工具，数量：', tools.length)
    
    // 验证必填字段
    const invalidTools = tools.filter(tool => !tool.name || !tool.url)
    if (invalidTools.length > 0) {
      return Response.json(
        { success: false, errorMessage: `发现 ${invalidTools.length} 个工具缺少必填字段（name 或 url）` },
        { status: 400 }
      )
    }
    
    // 使用原始SQL来绕过schema cache问题
    let insertedCount = 0
    const errors = []
    
    for (const tool of tools) {
      try {
        // 首先确保分类存在
        const catelogName = tool.catelog || tool.category || '默认分类'
        
        // 使用原始SQL插入分类（如果不存在）
        const insertCatelogSQL = `
          INSERT INTO nav_catelog (name, sort, hide) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (name) DO NOTHING
          RETURNING id;
        `
        
        await supabaseAdmin
          .rpc('exec_sql_with_params', {
            sql: insertCatelogSQL,
            params: [catelogName, 999, false]
          })
        
        // 获取分类ID
        const getCatelogSQL = `SELECT id FROM nav_catelog WHERE name = $1 LIMIT 1;`
        const { data: catelogData } = await supabaseAdmin
          .rpc('exec_sql_with_params', {
            sql: getCatelogSQL,
            params: [catelogName]
          })
        
        let catelogId = 1 // 默认分类ID
        if (catelogData && catelogData.length > 0) {
          catelogId = catelogData[0].id
        }
        
        // 插入工具
        const insertToolSQL = `
          INSERT INTO nav_table (name, url, logo, catelog, description, sort, hide) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id;
        `
        
        const { error: toolError } = await supabaseAdmin
          .rpc('exec_sql_with_params', {
            sql: insertToolSQL,
            params: [
              tool.name,
              tool.url,
              tool.logo || '',
              catelogId,
              tool.desc || tool.description || '',
              tool.sort || insertedCount + 1,
              tool.hide || false
            ]
          })
        
        if (toolError) {
          console.error('插入工具失败：', toolError)
          errors.push(`${tool.name}: ${toolError.message}`)
        } else {
          insertedCount++
          console.log(`成功插入工具: ${tool.name}`)
        }
        
      } catch (err) {
        console.error('处理工具失败：', tool.name, err)
        const errorMessage = err instanceof Error ? err.message : '未知错误'
        errors.push(`${tool.name}: ${errorMessage}`)
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
      message: `成功导入 ${insertedCount} 个工具${errors.length > 0 ? `，${errors.length} 个失败` : ''}`,
      data: {
        importedCount: insertedCount,
        totalCount: tools.length,
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