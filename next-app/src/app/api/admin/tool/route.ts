import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const POST = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const toolData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('nav_table')
      .insert({
        name: toolData.name,
        url: toolData.url,
        logo: toolData.logo,
        catelog: toolData.catelog,
        description: toolData.desc || toolData.description,
        sort: toolData.sort || 0,
        hide: toolData.hide || false
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '添加工具成功',
      data
    })
    
  } catch (error) {
    console.error('Add tool error:', error)
    return Response.json(
      { success: false, errorMessage: '添加工具失败' },
      { status: 500 }
    )
  }
})