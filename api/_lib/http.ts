import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8').send(JSON.stringify(data));
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('allow', allowed.join(', '));
  json(res, 405, { error: `Method not allowed. Use: ${allowed.join(', ')}` });
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export function withErrorHandling(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        json(res, err.status, { error: err.message });
        return;
      }
      if (err instanceof ZodError) {
        json(res, 400, { error: 'Invalid request body', issues: err.issues });
        return;
      }
      console.error(err);
      json(res, 500, { error: 'Internal server error' });
    }
  };
}

export function getIdParam(req: VercelRequest): string {
  const id = req.query.id;
  if (typeof id !== 'string' || id.length === 0) {
    throw new HttpError(400, 'Missing id parameter');
  }
  return id;
}
