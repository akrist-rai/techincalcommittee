import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { memberSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    const rows = await sql()`select * from members order by order_index asc, created_at asc`;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    await requireSession(req);
    const data = memberSchema.parse(req.body);
    const rows = await sql()`
      insert into members (name, role, img_url, quote, stats, size, order_index)
      values (
        ${data.name}, ${data.role}, ${data.img_url}, ${data.quote}, ${JSON.stringify(data.stats)}, ${data.size},
        (select coalesce(max(order_index), -1) + 1 from members)
      )
      returning *
    `;
    return json(res, 201, rows[0]);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
