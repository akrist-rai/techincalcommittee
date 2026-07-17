import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { sectionCreateSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    // Full list (including hidden) is admin-only; the public site reads /api/site instead.
    await requireSession(req);
    const rows = await sql()`select * from sections order by order_index asc, created_at asc`;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    await requireSession(req);
    const data = sectionCreateSchema.parse(req.body);
    const rows = await sql()`
      insert into sections (type, title, subtitle, visible, accent, config, order_index)
      values (
        ${data.type}, ${data.title}, ${data.subtitle}, ${data.visible}, ${data.accent}, ${JSON.stringify(data.config)},
        (select coalesce(max(order_index), -1) + 1 from sections)
      )
      returning *
    `;
    return json(res, 201, rows[0]);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
