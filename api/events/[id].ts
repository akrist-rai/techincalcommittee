import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getIdParam, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { eventUpdateSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const id = getIdParam(req);

  if (req.method === 'PUT') {
    await requireSession(req);
    const patch = eventUpdateSchema.parse(req.body);

    const existingRows = await sql()`select * from events where id = ${id} limit 1`;
    const existing = existingRows[0];
    if (!existing) throw new HttpError(404, 'Event not found');

    const merged = { ...existing, ...patch };
    const rows = await sql()`
      update events set
        chapter = ${merged.chapter},
        page = ${merged.page},
        title = ${merged.title},
        tag = ${merged.tag},
        date_label = ${merged.date_label},
        description = ${merged.description},
        order_index = ${merged.order_index},
        updated_at = now()
      where id = ${id}
      returning *
    `;
    return json(res, 200, rows[0]);
  }

  if (req.method === 'DELETE') {
    await requireSession(req);
    const rows = await sql()`delete from events where id = ${id} returning id`;
    if (rows.length === 0) throw new HttpError(404, 'Event not found');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
