import { NextRequest } from 'next/server'
import { verifyJWT, verifyApiToken } from './jwt'

export interface AuthResult {
  isAuthenticated: boolean
  user?: {
    userId: number
    username: string
  }
  error?: string
}

export const authenticateRequest = (request: NextRequest): AuthResult => {
  const authHeader = request.headers.get('authorization')
  const cookieToken = request.cookies.get('auth-token')?.value
  
  const token = authHeader?.replace('Bearer ', '') || cookieToken
  
  if (!token) {
    return {
      isAuthenticated: false,
      error: 'No token provided'
    }
  }
  
  const payload = verifyJWT(token)
  
  if (!payload) {
    return {
      isAuthenticated: false,
      error: 'Invalid token'
    }
  }
  
  return {
    isAuthenticated: true,
    user: {
      userId: payload.userId,
      username: payload.username
    }
  }
}

export const authenticateApiToken = (request: NextRequest): AuthResult => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      error: 'No API token provided'
    }
  }
  
  const token = authHeader.replace('Bearer ', '')
  const payload = verifyApiToken(token)
  
  if (!payload) {
    return {
      isAuthenticated: false,
      error: 'Invalid API token'
    }
  }
  
  return {
    isAuthenticated: true,
    user: {
      userId: payload.id,
      username: payload.name
    }
  }
}

export const requireAuth = (handler: (request: NextRequest, auth: AuthResult) => Promise<Response>) => {
  return async (request: NextRequest) => {
    const auth = authenticateRequest(request)
    
    if (!auth.isAuthenticated) {
      return Response.json(
        { success: false, errorMessage: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(request, auth)
  }
}