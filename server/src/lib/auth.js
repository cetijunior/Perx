import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const secret = () => process.env.JWT_SECRET || 'perx-dev-secret'

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, email: user.email },
    secret(),
    { expiresIn: '30d' },
  )
}

// Short-lived, single-use token scoped to one specific benefit redemption.
// jti is consumed (stored on the Redemption row) the moment it's redeemed, so a
// screenshot or replay of an already-scanned code can never redeem again.
export function signCardToken(user, employeeId, providerSlug) {
  const jti = crypto.randomUUID()
  const token = jwt.sign(
    { sub: String(user._id), employeeId: String(employeeId), providerSlug, typ: 'card', jti },
    secret(),
    { expiresIn: '3m' },
  )
  return { token, jti }
}

export function verifyCardToken(token) {
  const payload = jwt.verify(token, secret())
  if (payload.typ !== 'card') throw new Error('not_a_card_token')
  return payload
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
