import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const POST = requireAuth(async (request: NextRequest, _auth) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json(
        { success: false, errorMessage: '没有上传文件' },
        { status: 400 }
      )
    }
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, errorMessage: '不支持的文件类型' },
        { status: 400 }
      )
    }
    
    // 检查文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json(
        { success: false, errorMessage: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }
    
    // 将文件转换为Base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    // const dataUrl = `data:${file.type};base64,${base64}`
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}_${randomStr}_${file.name}`
    
    // 保存到数据库
    const { data, error } = await supabaseAdmin
      .from('nav_img')
      .insert({
        name: fileName,
        data: base64,
        type: file.type,
        size: file.size
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return Response.json({
      success: true,
      message: '上传成功',
      data: {
        id: data.id,
        name: data.name,
        url: `/api/img?url=${encodeURIComponent(data.name)}`,
        type: data.type,
        size: data.size
      }
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { success: false, errorMessage: '上传失败' },
      { status: 500 }
    )
  }
})