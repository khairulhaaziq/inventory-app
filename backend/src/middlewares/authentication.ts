import type { MiddlewareHandler } from "hono"
import { authService } from "../services/auth.service"

export const authMiddleware: MiddlewareHandler<{
  Variables: {
    userId: string,
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      username: string;
      roleId: number | null;
    }
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
      c.set('user', user)
      return await next()
    } else {
      return c.newResponse('Unauthorized', {status: 401})
    }
  } catch {
    return c.newResponse('Unauthorized', {status: 401})
  }
}
