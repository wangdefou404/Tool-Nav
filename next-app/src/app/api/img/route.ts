import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return Response.json(
        { success: false, errorMessage: 'URL参数不能为空' },
        { status: 400 }
      )
    }
    
    // 从数据库查询图片
    const { data: img, error } = await supabase
      .from('nav_img')
      .select('*')
      .eq('url', url)
      .single()
    
    if (error || !img || !img.value) {
      return Response.json(
        { success: false, errorMessage: '未找到图片' },
        { status: 404 }
      )
    }
    
    try {
      // 解码base64图片
      const imgBuffer = Buffer.from(img.value, 'base64')
      
      // 确定图片类型
      const urlParts = url.split('.')
      const suffix = urlParts[urlParts.length - 1]
      let contentType = 'image/x-icon'
      
      if (suffix === 'svg' || url.includes('.svg')) {
        contentType = 'image/svg+xml'
      } else if (suffix === 'png') {
        contentType = 'image/png'
      } else if (suffix === 'jpg' || suffix === 'jpeg') {
        contentType = 'image/jpeg'
      } else if (suffix === 'gif') {
        contentType = 'image/gif'
      } else if (suffix === 'webp') {
        contentType = 'image/webp'
      }
      
      return new Response(imgBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        }
      })
      
    } catch {
      return Response.json(
        { success: false, errorMessage: '图片解码失败' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Get image error:', error)
    return Response.json(
      { success: false, errorMessage: '服务器内部错误' },
      { status: 500 }
    )
  }
}