import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq, sql as rawSql } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { events } from '../../db/schema.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { eventSchema, eventUpdateSchema } from '../_lib/schema.js';
import { serializeEvent } from '../_lib/serialize.js';

async function list(res: VercelResponse) {
  const rows = await db().select().from(events).orderBy(asc(events.orderIndex), asc(events.createdAt));
  json(res, 200, rows.map(serializeEvent));
}

async function create(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const data = eventSchema.parse(req.body);
  const rows = await db().insert(events).values({
    clubId: data.club_id,
    chapter: data.chapter,
    page: data.page,
    title: data.title,
    tag: data.tag,
    dateLabel: data.date_label,
    description: data.description,
    imgUrl: data.img_url,
    orderIndex: rawSql`(select coalesce(max(order_index), -1) + 1 from events)`,
  }).returning();
  json(res, 201, serializeEvent(rows[0]));
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const patch = eventUpdateSchema.parse(req.body);

  const existingRows = await db().select().from(events).where(eq(events.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'Event not found');

  const rows = await db().update(events).set({
    clubId: patch.club_id !== undefined ? patch.club_id : existing.clubId,
    chapter: patch.chapter ?? existing.chapter,
    page: patch.page ?? existing.page,
    title: patch.title ?? existing.title,
    tag: patch.tag ?? existing.tag,
    dateLabel: patch.date_label ?? existing.dateLabel,
    description: patch.description ?? existing.description,
    imgUrl: patch.img_url ?? existing.imgUrl,
    orderIndex: patch.order_index ?? existing.orderIndex,
    updatedAt: new Date(),
  }).where(eq(events.id, id)).returning();
  json(res, 200, serializeEvent(rows[0]));
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await db().delete(events).where(eq(events.id, id)).returning({ id: events.id });
  if (rows.length === 0) throw new HttpError(404, 'Event not found');
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
