import type { Request, Response } from 'express';

export function generateController(_req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'Not implemented yet',
  });
}
