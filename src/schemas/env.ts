import { z } from 'zod';

export const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_PORT: z.string().optional(),
  VITE_API_PROXY_TARGET: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedEnv: ClientEnv | null = null;

export function validateClientEnv(): ClientEnv {
  if (!cachedEnv) {
    cachedEnv = clientEnvSchema.parse(import.meta.env);
  }
  return cachedEnv;
}
