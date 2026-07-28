import type { Request, Response } from 'express';
import { generateRequestBodySchema } from '../schemas/generate.schema.js';
import { generateStudyContent } from '../services/ai.service.js';

export async function generateController(req: Request, res: Response): Promise<void> {
  const parsed = generateRequestBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid request. Notes must be between 10 and 5000 characters.',
    });
    return;
  }

  const result = await generateStudyContent(parsed.data.notes);

  if (result.success) {
    res.json({ success: true, data: result.data });
    return;
  }

  const statusMap: Record<string, number> = {
    rate_limit: 429,
    auth: 502,
    timeout: 504,
    validation: 422,
    network: 502,
    empty: 422,
    json: 422,
  };

  const status = statusMap[result.errorCode] ?? 502;

  res.status(status).json({ success: false, error: result.error });
}
