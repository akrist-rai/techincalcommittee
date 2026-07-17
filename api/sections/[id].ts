import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getIdParam, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { sectionUpdateSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const id = getIdParam(req);

  if (req.method === 'PUT') {
    await requireSession(req);
    const patch = sectionUpdateSchema.parse(req.body);

    const existingRows = await sql()`select * from sections where id = ${id} limit 1`;
    const existing = existingRows[0] as
      | { type: string; title: string; subtitle: string; visible: boolean; accent: string; order_index: number; config: unknown }
      | undefined;
    if (!existing) throw new HttpError(404, 'Section not found');

    const merged = {
      type: patch.type ?? existing.type,
      title: patch.title ?? existing.title,
      subtitle: patch.subtitle ?? existing.subtitle,
      visible: patch.visible ?? existing.visible,
      accent: patch.accent ?? existing.accent,
      order_index: patch.order_index ?? existing.order_index,
      config: patch.config ?? existing.config,
    };

    const rows = await sql()`
      update sections set
        type = ${merged.type},
        title = ${merged.title},
        subtitle = ${merged.subtitle},
        visible = ${merged.visible},
        accent = ${merged.accent},
        order_index = ${merged.order_index},
        config = ${JSON.stringify(merged.config)},
        updated_at = now()
      where id = ${id}
      returning *
    `;
    return json(res, 200, rows[0]);
  }

  if (req.method === 'DELETE') {
    await requireSession(req);
    const rows = await sql()`delete from sections where id = ${id} returning id`;
    if (rows.length === 0) throw new HttpError(404, 'Section not found');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
