import type { MiddlewareHandler } from "hono"
import { authService } from "../services/auth.service"

export const authMiddleware: MiddlewareHandler<{
  Variables: {
    userId: string
  }
}> = async (c, next) => {
  const sessionId = c.req.header().authorization?.split('Bearer ')[1]
  if (!sessionId) {
    return c.newResponse('Unauthorized', {status: 401})
  }
  try {
    const user = await authService.validateSession(sessionId)
    if (user) {
      c.set('userId', user.id)
      return await next()
    } else {
      return c.newResponse('Unauthorized', {status: 401})
    }
  } catch {
    return c.newResponse('Unauthorized', {status: 401})
  }
}
