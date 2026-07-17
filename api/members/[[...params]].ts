import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { memberSchema, memberUpdateSchema } from '../_lib/schema.js';

async function list(res: VercelResponse) {
  const rows = await sql()`select * from members order by order_index asc, created_at asc`;
  json(res, 200, rows);
}

async function create(req: VercelRequest, res: VercelResponse) {
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
  json(res, 201, rows[0]);
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
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
  json(res, 200, rows[0]);
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await sql()`delete from members where id = ${id} returning id`;
  if (rows.length === 0) throw new HttpError(404, 'Member not found');
  json(res, 200, { ok: true });
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const [id] = getCatchAllParams(req);

  if (!id) {
    if (req.method === 'GET') return list(res);
    if (req.method === 'POST') return create(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  if (req.method === 'PUT') return update(req, res, id);
  if (req.method === 'DELETE') return remove(req, res, id);
  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
