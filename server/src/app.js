import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import providerRoutes from './routes/providers.js'
import employeeRoutes from './routes/employees.js'
import requestRoutes from './routes/requests.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.VERCEL ? 'combined' : 'dev'))

app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'perx-api',
    db: process.env.DATABASE_URL ? 'configured' : 'missing',
  })
})

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/providers', providerRoutes)
app.use('/employees', employeeRoutes)
app.use('/requests', requestRoutes)
app.use('/admin', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'server_error' })
})

export default app
