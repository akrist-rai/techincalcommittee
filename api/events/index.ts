import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { eventSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    const rows = await sql()`select * from events order by order_index asc, created_at asc`;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    await requireSession(req);
    const data = eventSchema.parse(req.body);
    const rows = await sql()`
      insert into events (chapter, page, title, tag, date_label, description, order_index)
      values (
        ${data.chapter}, ${data.page}, ${data.title}, ${data.tag}, ${data.date_label}, ${data.description},
        (select coalesce(max(order_index), -1) + 1 from events)
      )
      returning *
    `;
    return json(res, 201, rows[0]);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
