import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[server]', err);
  res.status(500).json({
    error: {
      message: err.message || 'Internal server error',
    },
  });
}
