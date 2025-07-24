import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (_request: NextRequest, _auth) => {
  try {
    const { data: seoSettings, error } = await supabaseAdmin
      .from('nav_seo_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    // 如果没有SEO设置，返回默认值
    const defaultSeo = {
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      meta_author: '',
      meta_robots: 'index,follow',
      og_title: '',
      og_description: '',
      og_image: '',
      og_url: '',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      twitter_title: '',
      twitter_description: '',
      twitter_image: '',
      canonical_url: '',
      structured_data: '{}'
    }
    
    return Response.json({
      success: true,
      data: seoSettings || defaultSeo
    })
    
  } catch (error) {
    console.error('Get SEO settings error:', error)
    return Response.json(
      { success: false, errorMessage: '获取SEO设置失败' },
      { status: 500 }
    )
  }
})

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const seoData = await request.json()
    
    // 首先检查是否已存在SEO设置记录
    const { data: existingSeo } = await supabaseAdmin
      .from('nav_seo_settings')
      .select('id')
      .limit(1)
      .single()
    
    let result
    
    if (existingSeo) {
      // 更新现有记录
      const { data, error } = await supabaseAdmin
        .from('nav_seo_settings')
        .update(seoData)
        .eq('id', existingSeo.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // 创建新记录
      const { data, error } = await supabaseAdmin
        .from('nav_seo_settings')
        .insert(seoData)
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return Response.json({
      success: true,
      message: '更新SEO设置成功',
      data: result
    })
    
  } catch (error) {
    console.error('Update SEO settings error:', error)
    return Response.json(
      { success: false, errorMessage: '更新SEO设置失败' },
      { status: 500 }
    )
  }
})