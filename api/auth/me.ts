import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await getSessionUser(req);
  json(res, 200, { user });
});
