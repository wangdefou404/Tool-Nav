import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const DELETE = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const url = new URL(request.url)
    const tokenId = url.pathname.split('/').pop()
    
    const { error } = await supabaseAdmin
      .from('nav_api_token')
      .update({ disabled: 1 })
      .eq('id', tokenId)
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '删除API Token成功'
    })
    
  } catch (error) {
    console.error('Delete API token error:', error)
    return Response.json(
      { success: false, errorMessage: '删除API Token失败' },
      { status: 500 }
    )
  }
})