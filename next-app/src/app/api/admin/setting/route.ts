import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const settingData = await request.json()
    
    // 首先检查是否已存在设置记录
    const { data: existingSetting } = await supabaseAdmin
      .from('nav_setting')
      .select('id')
      .limit(1)
      .single()
    
    let result
    
    if (existingSetting) {
      // 更新现有记录
      const { data, error } = await supabaseAdmin
        .from('nav_setting')
        .update({
          favicon: settingData.favicon,
          title: settingData.title,
          gov_record: settingData.govRecord,
          logo192: settingData.logo192,
          logo512: settingData.logo512,
          hide_admin: settingData.hideAdmin,
          hide_github: settingData.hideGithub,
          jump_target_blank: settingData.jumpTargetBlank
        })
        .eq('id', existingSetting.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // 创建新记录
      const { data, error } = await supabaseAdmin
        .from('nav_setting')
        .insert({
          favicon: settingData.favicon,
          title: settingData.title,
          gov_record: settingData.govRecord,
          logo192: settingData.logo192,
          logo512: settingData.logo512,
          hide_admin: settingData.hideAdmin,
          hide_github: settingData.hideGithub,
          jump_target_blank: settingData.jumpTargetBlank
        })
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return Response.json({
      success: true,
      message: '更新设置成功',
      data: result
    })
    
  } catch (error) {
    console.error('Update setting error:', error)
    return Response.json(
      { success: false, errorMessage: '更新设置失败' },
      { status: 500 }
    )
  }
})