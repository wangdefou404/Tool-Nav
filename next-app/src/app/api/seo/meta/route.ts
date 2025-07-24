import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    // 获取SEO设置数据
    const { data: seoSettings, error } = await supabase
      .from('nav_seo_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    // 如果没有SEO设置，返回默认值
    const defaultSeo = {
      title: '得否AI工具箱',
      description: '一个优秀的导航工具箱',
      keywords: '导航,工具,AI',
      author: '',
      og_title: '得否AI工具箱',
      og_description: '一个优秀的导航工具箱',
      og_image: '',
      og_url: '',
      twitter_card: 'summary',
      twitter_site: '',
      twitter_creator: '',
      canonical: '',
      robots: 'index,follow',
      google_site_verification: '',
      baidu_site_verification: '',
      bing_site_verification: ''
    }
    
    const seo = seoSettings || defaultSeo
    
    return Response.json({
      success: true,
      data: seo
    })
    
  } catch (error) {
    console.error('Get SEO meta error:', error)
    return Response.json(
      { success: false, errorMessage: '获取SEO数据失败' },
      { status: 500 }
    )
  }
}