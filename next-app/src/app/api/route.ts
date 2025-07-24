import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request)
    const isLoggedIn = auth.isAuthenticated
    
    // 获取工具数据
    let toolsQuery = supabase
      .from('nav_table')
      .select('*')
      .order('sort', { ascending: true })
    
    if (!isLoggedIn) {
      toolsQuery = toolsQuery.eq('hide', false)
    }
    
    const { data: tools, error: toolsError } = await toolsQuery
    
    if (toolsError) {
      throw toolsError
    }
    
    // 获取分类数据
    let categoriesQuery = supabase
      .from('nav_catelog')
      .select('*')
      .order('sort', { ascending: true })
    
    if (!isLoggedIn) {
      categoriesQuery = categoriesQuery.eq('hide', false)
    }
    
    const { data: categories, error: categoriesError } = await categoriesQuery
    
    if (categoriesError) {
      throw categoriesError
    }
    
    // 获取设置数据
    const { data: settings, error: settingsError } = await supabase
      .from('nav_setting')
      .select('*')
      .limit(1)
      .single()
    
    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError
    }
    
    return Response.json({
      success: true,
      data: {
        tools: tools || [],
        catelogs: categories || [],
        setting: settings || {}
      }
    })
    
  } catch (error) {
    console.error('Get all data error:', error)
    return Response.json(
      { success: false, errorMessage: '获取数据失败' },
      { status: 500 }
    )
  }
}