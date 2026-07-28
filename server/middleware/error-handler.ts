import type { Request, Response, NextFunction } from 'express';
import { getEnv } from '../utils/env.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDev = (() => {
    try { return getEnv().NODE_ENV === 'development'; } catch { return false; }
  })();

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { message: 'Invalid JSON body' } });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';

  console.error('[server]', message);

  res.status(500).json({
    error: {
      message: isDev ? message : 'Internal server error',
    },
  });
}
