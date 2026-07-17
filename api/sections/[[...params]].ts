import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { reorderSchema, sectionCreateSchema, sectionUpdateSchema } from '../_lib/schema.js';

async function list(req: VercelRequest, res: VercelResponse) {
  // Full list (including hidden) is admin-only; the public site reads /api/site instead.
  await requireSession(req);
  const rows = await sql()`select * from sections order by order_index asc, created_at asc`;
  json(res, 200, rows);
}

async function create(req: VercelRequest, res: VercelResponse) {
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
  json(res, 201, rows[0]);
}

async function reorder(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const { order } = reorderSchema.parse(req.body);

  await Promise.all(
    order.map((id, index) => sql()`update sections set order_index = ${index} where id = ${id}`),
  );

  const rows = await sql()`select * from sections order by order_index asc, created_at asc`;
  json(res, 200, rows);
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
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
  json(res, 200, rows[0]);
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await sql()`delete from sections where id = ${id} returning id`;
  if (rows.length === 0) throw new HttpError(404, 'Section not found');
  json(res, 200, { ok: true });
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const [first] = getCatchAllParams(req);

  if (!first) {
    if (req.method === 'GET') return list(req, res);
    if (req.method === 'POST') return create(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  if (first === 'reorder') {
    if (req.method === 'POST') return reorder(req, res);
    return methodNotAllowed(res, ['POST']);
  }

  if (req.method === 'PUT') return update(req, res, first);
  if (req.method === 'DELETE') return remove(req, res, first);
  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
