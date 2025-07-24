import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 客户端使用的Supabase实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端使用的Supabase实例（具有管理员权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 数据库表类型定义
export interface NavUser {
  id: number
  username: string
  password: string
  created_at?: string
}

export interface NavSetting {
  id: number
  favicon?: string
  title?: string
  gov_record?: string
  logo192?: string
  logo512?: string
  hide_admin?: boolean
  hide_github?: boolean
  jump_target_blank?: boolean
}

export interface NavTool {
  id: number
  name: string
  url: string
  logo?: string
  catelog?: string
  description?: string
  sort?: number
  hide?: boolean
  created_at?: string
}

export interface NavCategory {
  id: number
  name: string
  sort?: number
  hide?: boolean
}

export interface NavApiToken {
  id: number
  name: string
  value: string
  disabled?: number
  created_at?: string
}

export interface NavImg {
  id: number
  url: string
  value: string
}

export interface NavAdsSettings {
  id: number
  google_adsense_enabled?: boolean
  google_adsense_publisher_id?: string
  google_adsense_ad_slot?: string
  google_adsense_auto_ads_code?: string
  google_analytics_enabled?: boolean
  google_analytics_tracking_id?: string
  google_analytics_gtm_code?: string
  custom_ads_enabled?: boolean
  custom_ads_header_code?: string
  custom_ads_footer_code?: string
  custom_ads_sidebar_code?: string
}

export interface NavSeoSettings {
  id: number
  title?: string
  description?: string
  keywords?: string
  author?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_url?: string
  twitter_card?: string
  twitter_site?: string
  twitter_creator?: string
  canonical?: string
  robots?: string
  google_site_verification?: string
  baidu_site_verification?: string
  bing_site_verification?: string
}