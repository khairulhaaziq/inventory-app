/* eslint-disable @typescript-eslint/no-namespace */
import {z} from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),
  BACKEND_URL: z.string(),
  SESSION_SECRET: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function initEnv() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );

    throw new Error('Invalid environment variables');
  }
}
