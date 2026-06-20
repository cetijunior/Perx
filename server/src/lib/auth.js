import jwt from 'jsonwebtoken'

const secret = () => process.env.JWT_SECRET || 'perx-dev-secret'

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, email: user.email },
    secret(),
    { expiresIn: '30d' },
  )
}

export function requireAuth(req, _res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return next(Object.assign(new Error('unauthorized'), { status: 401 }))
  try {
    req.auth = jwt.verify(token, secret())
    next()
  } catch {
    next(Object.assign(new Error('invalid_token'), { status: 401 }))
  }
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.auth || req.auth.role !== role) {
      return next(Object.assign(new Error('forbidden'), { status: 403 }))
    }
    next()
  }
}
