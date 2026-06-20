import 'dotenv/config'
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
const port = Number(process.env.PORT) || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => res.json({ ok: true, service: 'perx-api' }))

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

connectDB().then(() => {
  app.listen(port, () => console.log(`perx-api listening on :${port}`))
})
