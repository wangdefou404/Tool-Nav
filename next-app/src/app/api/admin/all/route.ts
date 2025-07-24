import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    // 获取所有工具（包括隐藏的）
    const { data: tools, error: toolsError } = await supabaseAdmin
      .from('nav_table')
      .select('*')
      .order('sort', { ascending: true })
    
    if (toolsError) {
      throw toolsError
    }
    
    // 获取所有分类（包括隐藏的）
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('nav_catelog')
      .select('*')
      .order('sort', { ascending: true })
    
    if (categoriesError) {
      throw categoriesError
    }
    
    // 获取设置数据
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('nav_setting')
      .select('*')
      .limit(1)
      .single()
    
    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError
    }
    
    // 获取API tokens
    const { data: apiTokens, error: tokensError } = await supabaseAdmin
      .from('nav_api_token')
      .select('id, name, value, disabled, created_at')
      .eq('disabled', 0)
      .order('created_at', { ascending: false })
    
    if (tokensError) {
      throw tokensError
    }
    
    // 获取用户信息
    const { data: user, error: userError } = await supabaseAdmin
      .from('nav_user')
      .select('id, username')
      .eq('id', auth.user!.userId)
      .single()
    
    if (userError) {
      throw userError
    }
    
    return Response.json({
      success: true,
      data: {
        tools: tools || [],
        catelogs: categories || [],
        setting: settings || {},
        apiTokens: apiTokens || [],
        user: user
      }
    })
    
  } catch (error) {
    console.error('Get admin all data error:', error)
    return Response.json(
      { success: false, errorMessage: '获取管理员数据失败' },
      { status: 500 }
    )
  }
})