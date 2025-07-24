import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (_request: NextRequest, _auth) => {
  try {
    const { data: tools, error } = await supabaseAdmin
      .from('nav_table')
      .select('*')
      .order('sort', { ascending: true })
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '导出工具成功',
      data: tools || []
    })
    
  } catch (error) {
    console.error('Export tools error:', error)
    return Response.json(
      { success: false, errorMessage: '导出工具失败' },
      { status: 500 }
    )
  }
})