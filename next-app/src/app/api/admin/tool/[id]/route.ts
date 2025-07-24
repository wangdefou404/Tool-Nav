import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const url = new URL(request.url)
    const toolId = url.pathname.split('/').pop()
    const toolData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('nav_table')
      .update({
        name: toolData.name,
        url: toolData.url,
        logo: toolData.logo,
        catelog: toolData.catelog,
        description: toolData.desc || toolData.description,
        sort: toolData.sort,
        hide: toolData.hide
      })
      .eq('id', toolId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '更新工具成功',
      data
    })
    
  } catch (error) {
    console.error('Update tool error:', error)
    return Response.json(
      { success: false, errorMessage: '更新工具失败' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const url = new URL(request.url)
    const toolId = url.pathname.split('/').pop()
    
    const { error } = await supabaseAdmin
      .from('nav_table')
      .delete()
      .eq('id', toolId)
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '删除工具成功'
    })
    
  } catch (error) {
    console.error('Delete tool error:', error)
    return Response.json(
      { success: false, errorMessage: '删除工具失败' },
      { status: 500 }
    )
  }
})