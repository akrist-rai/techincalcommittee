import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { reorderSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await requireSession(req);

  const { order } = reorderSchema.parse(req.body);

  await Promise.all(
    order.map((id, index) => sql()`update sections set order_index = ${index} where id = ${id}`),
  );

  const rows = await sql()`select * from sections order by order_index asc, created_at asc`;
  json(res, 200, rows);
});
