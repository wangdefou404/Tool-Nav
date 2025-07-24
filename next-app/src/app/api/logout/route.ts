import { NextRequest } from 'next/server'

export const GET = async (_request: NextRequest) => {
  try {
    const response = Response.json({
      success: true,
      message: '登出成功'
    })
    
    // 清除认证cookie
    response.headers.set('Set-Cookie', 'auth-token=; Path=/; HttpOnly; Max-Age=0')
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { success: false, errorMessage: '登出失败' },
      { status: 500 }
    )
  }
}