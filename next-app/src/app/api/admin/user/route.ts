import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { hashPassword } from '@/lib/jwt'

export const PUT = requireAuth(async (request: NextRequest, auth) => {
  try {
    const userData: { username?: string; password?: string } = await request.json()
    const userId = auth.user!.userId
    
    // 准备更新数据
    const updateData: { username?: string; password?: string } = {}
    
    if (userData.username) {
      updateData.username = userData.username
    }
    
    // 如果提供了新密码，则加密后更新
    if (userData.password) {
      updateData.password = await hashPassword(userData.password)
    }
    
    const { data, error } = await supabaseAdmin
      .from('nav_user')
      .update(updateData)
      .eq('id', userId)
      .select('id, username')
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '更新用户信息成功',
      data
    })
    
  } catch (error) {
    console.error('Update user error:', error)
    return Response.json(
      { success: false, errorMessage: '更新用户信息失败' },
      { status: 500 }
    )
  }
})