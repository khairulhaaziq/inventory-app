import { Hono } from 'hono'
import { authService } from '../services/auth.service'
import { authValidator } from '../validators/auth.validator'
import { authMiddleware } from '../middlewares/authentication'

const app = new Hono()

app
  .post('/login', authValidator.login, async (c) => {
    try {
      const session = await authService.login(c.req.valid('json').username, c.req.valid('json').password)
      if (session) {
        return c.json(session)
      }
      return c.newResponse('Invalid username or password', {status: 404})
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .post('/register', authValidator.register, async (c) => {
    try {
      const session = await authService.register(c.req.valid('json').username, c.req.valid('json').password)
      if (session) {
        return c.json(session)
      }
      return c.newResponse('Failed to create new user', {status: 500})
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .post('/logout', authMiddleware, async (c) => {
    await authService.logout(c.get('userId'))
    return c.newResponse('Successfully logout')
  })

export {app as authRoutes}
