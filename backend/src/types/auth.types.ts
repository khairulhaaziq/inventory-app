import type { z } from 'zod';
import type { authValidator } from '../validators/auth.validator';

export type AuthLogin = z.infer<typeof authValidator.loginSchema>
export type AuthRegister = z.infer<typeof authValidator.registerSchema>
