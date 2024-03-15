import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from './middlewares/logger'
import { inventoryRoutes } from './routes/inventory.routes'
import { cors } from 'hono/cors'
import { initEnv } from './libs/env'
import { authRoutes } from './routes/auth.routes'

const app = new Hono()

initEnv();

app.use(secureHeaders())
app.use(logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/health_check', c=>c.text('ok'))
app.route('/api', authRoutes)
app.route('/api', inventoryRoutes)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app

