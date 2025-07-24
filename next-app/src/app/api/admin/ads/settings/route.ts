import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (_request: NextRequest, _auth) => {
  try {
    const { data: adsSettings, error } = await supabaseAdmin
      .from('nav_ads_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    // 如果没有广告设置，返回默认值
    const defaultAds = {
      google_adsense_enabled: false,
      google_adsense_publisher_id: '',
      google_adsense_ad_slot: '',
      google_adsense_auto_ads_code: '',
      google_analytics_enabled: false,
      google_analytics_tracking_id: '',
      google_analytics_gtm_code: '',
      custom_ads_enabled: false,
      custom_ads_header_code: '',
      custom_ads_footer_code: '',
      custom_ads_sidebar_code: ''
    }
    
    return Response.json({
      success: true,
      data: adsSettings || defaultAds
    })
    
  } catch (error) {
    console.error('Get ads settings error:', error)
    return Response.json(
      { success: false, errorMessage: '获取广告设置失败' },
      { status: 500 }
    )
  }
})

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const adsData = await request.json()
    
    // 首先检查是否已存在广告设置记录
    const { data: existingAds } = await supabaseAdmin
      .from('nav_ads_settings')
      .select('id')
      .limit(1)
      .single()
    
    let result
    
    if (existingAds) {
      // 更新现有记录
      const { data, error } = await supabaseAdmin
        .from('nav_ads_settings')
        .update(adsData)
        .eq('id', existingAds.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // 创建新记录
      const { data, error } = await supabaseAdmin
        .from('nav_ads_settings')
        .insert(adsData)
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return Response.json({
      success: true,
      message: '更新广告设置成功',
      data: result
    })
    
  } catch (error) {
    console.error('Update ads settings error:', error)
    return Response.json(
      { success: false, errorMessage: '更新广告设置失败' },
      { status: 500 }
    )
  }
})