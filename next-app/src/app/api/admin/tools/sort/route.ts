import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const { tools } = await request.json()
    
    if (!Array.isArray(tools)) {
      return Response.json(
        { success: false, errorMessage: '工具数据格式错误' },
        { status: 400 }
      )
    }
    
    // 批量更新工具排序
    const updates = tools.map((tool, index) => 
      supabaseAdmin
        .from('nav_table')
        .update({ sort: index })
        .eq('id', tool.id)
    )
    
    await Promise.all(updates)
    
    return Response.json({
      success: true,
      message: '更新工具排序成功'
    })
    
  } catch (error) {
    console.error('Update tools sort error:', error)
    return Response.json(
      { success: false, errorMessage: '更新工具排序失败' },
      { status: 500 }
    )
  }
})