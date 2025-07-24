import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export interface JWTPayload {
  userId: number
  username: string
  iat?: number
  exp?: number
}

export const signJWT = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyJWT = (token: string): { userId: number; username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateApiToken = (name: string, id: number): string => {
  return jwt.sign({ name, id, type: 'api' }, JWT_SECRET, { expiresIn: '365d' })
}

export const verifyApiToken = (token: string): { name: string; id: number; type: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { name: string; id: number; type: string }
    if (decoded.type === 'api') {
      return decoded
    }
    return null
  } catch {
    return null
  }
}