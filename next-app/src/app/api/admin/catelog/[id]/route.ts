import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const PUT = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const url = new URL(request.url)
    const catelogId = url.pathname.split('/').pop()
    const categoryData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('nav_catelog')
      .update({
        name: categoryData.name,
        sort: categoryData.sort,
        hide: categoryData.hide
      })
      .eq('id', catelogId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '更新分类成功',
      data
    })
    
  } catch (error) {
    console.error('Update category error:', error)
    return Response.json(
      { success: false, errorMessage: '更新分类失败' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const url = new URL(request.url)
    const catelogId = url.pathname.split('/').pop()
    
    const { error } = await supabaseAdmin
      .from('nav_catelog')
      .delete()
      .eq('id', catelogId)
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '删除分类成功'
    })
    
  } catch (error) {
    console.error('Delete category error:', error)
    return Response.json(
      { success: false, errorMessage: '删除分类失败' },
      { status: 500 }
    )
  }
})