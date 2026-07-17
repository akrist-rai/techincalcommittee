import type { VercelRequest, VercelResponse } from '@vercel/node';
import { destroySession } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await destroySession(req, res);
  json(res, 200, { ok: true });
});
