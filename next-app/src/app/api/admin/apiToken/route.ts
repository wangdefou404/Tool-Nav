import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { generateApiToken } from '@/lib/jwt'

export const POST = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return Response.json(
        { success: false, errorMessage: 'Token名称不能为空' },
        { status: 400 }
      )
    }
    
    // 生成新的API Token
    const tokenValue = generateApiToken(name, Date.now())
    
    const { data, error } = await supabaseAdmin
      .from('nav_api_token')
      .insert({
        name,
        value: tokenValue,
        disabled: 0
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '添加API Token成功',
      data: {
        id: data.id,
        name: data.name,
        value: data.value
      }
    })
    
  } catch (error) {
    console.error('Add API token error:', error)
    return Response.json(
      { success: false, errorMessage: '添加API Token失败' },
      { status: 500 }
    )
  }
})