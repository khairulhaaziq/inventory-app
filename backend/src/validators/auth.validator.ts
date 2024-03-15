import { validator } from 'hono/validator'

import { z } from 'zod'

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})
const login = validator('json', (value, c) => {
  const parsed = loginSchema.safeParse(value)
  if (!parsed.success) {
    return c.text('Invalid request!', 400)
  }
  return parsed.data
})

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password don\'t match',
  path: ['confirmPassword'],
})
const register = validator('json', (value, c) => {
  const parsed = registerSchema.safeParse(value)
  if (!parsed.success) {
    return c.text('Invalid request!', 400)
  }
  return parsed.data
})

export const authValidator = {
  loginSchema,
  login,
  registerSchema,
  register,
}
