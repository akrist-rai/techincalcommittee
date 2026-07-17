import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq, sql as rawSql } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { members } from '../../db/schema.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { memberSchema, memberUpdateSchema } from '../_lib/schema.js';
import { serializeMember } from '../_lib/serialize.js';

async function list(res: VercelResponse) {
  const rows = await db().select().from(members).orderBy(asc(members.orderIndex), asc(members.createdAt));
  json(res, 200, rows.map(serializeMember));
}

async function create(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const data = memberSchema.parse(req.body);
  const rows = await db().insert(members).values({
    clubId: data.club_id,
    name: data.name,
    role: data.role,
    imgUrl: data.img_url,
    quote: data.quote,
    stats: data.stats,
    size: data.size,
    orderIndex: rawSql`(select coalesce(max(order_index), -1) + 1 from members)`,
  }).returning();
  json(res, 201, serializeMember(rows[0]));
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const patch = memberUpdateSchema.parse(req.body);

  const existingRows = await db().select().from(members).where(eq(members.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'Member not found');

  const rows = await db().update(members).set({
    clubId: patch.club_id !== undefined ? patch.club_id : existing.clubId,
    name: patch.name ?? existing.name,
    role: patch.role ?? existing.role,
    imgUrl: patch.img_url ?? existing.imgUrl,
    quote: patch.quote !== undefined ? patch.quote : existing.quote,
    stats: patch.stats ?? existing.stats,
    size: patch.size ?? existing.size,
    orderIndex: patch.order_index ?? existing.orderIndex,
    updatedAt: new Date(),
  }).where(eq(members.id, id)).returning();
  json(res, 200, serializeMember(rows[0]));
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await db().delete(members).where(eq(members.id, id)).returning({ id: members.id });
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
