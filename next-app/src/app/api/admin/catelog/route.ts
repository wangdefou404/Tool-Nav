import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const POST = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const categoryData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('nav_catelog')
      .insert({
        name: categoryData.name,
        sort: categoryData.sort || 0,
        hide: categoryData.hide || false
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '添加分类成功',
      data
    })
    
  } catch (error) {
    console.error('Add category error:', error)
    return Response.json(
      { success: false, errorMessage: '添加分类失败' },
      { status: 500 }
    )
  }
})