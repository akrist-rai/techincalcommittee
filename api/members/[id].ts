import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getIdParam, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { memberUpdateSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const id = getIdParam(req);

  if (req.method === 'PUT') {
    await requireSession(req);
    const patch = memberUpdateSchema.parse(req.body);

    const existingRows = await sql()`select * from members where id = ${id} limit 1`;
    const existing = existingRows[0];
    if (!existing) throw new HttpError(404, 'Member not found');

    const merged = { ...existing, ...patch };
    const rows = await sql()`
      update members set
        name = ${merged.name},
        role = ${merged.role},
        img_url = ${merged.img_url},
        quote = ${merged.quote},
        stats = ${JSON.stringify(merged.stats)},
        size = ${merged.size},
        order_index = ${merged.order_index},
        updated_at = now()
      where id = ${id}
      returning *
    `;
    return json(res, 200, rows[0]);
  }

  if (req.method === 'DELETE') {
    await requireSession(req);
    const rows = await sql()`delete from members where id = ${id} returning id`;
    if (rows.length === 0) throw new HttpError(404, 'Member not found');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
