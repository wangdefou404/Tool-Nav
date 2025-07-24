import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, signJWT } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json()
    
    if (!name || !password) {
      return Response.json(
        { success: false, errorMessage: '用户名和密码不能为空' },
        { status: 400 }
      )
    }
    
    // 从数据库查询用户
    const { data: user, error } = await supabaseAdmin
      .from('nav_user')
      .select('*')
      .eq('username', name)
      .single()
    
    if (error || !user) {
      return Response.json(
        { success: false, errorMessage: '用户不存在' },
        { status: 401 }
      )
    }
    
    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password)
    
    if (!isPasswordValid) {
      return Response.json(
        { success: false, errorMessage: '密码错误' },
        { status: 401 }
      )
    }
    
    // 生成JWT token
    const token = signJWT({
      userId: user.id,
      username: user.username
    })
    
    // 设置cookie
    const response = Response.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          name: user.username
        },
        token
      }
    })
    
    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
    )
    
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { success: false, errorMessage: '服务器内部错误' },
      { status: 500 }
    )
  }
}