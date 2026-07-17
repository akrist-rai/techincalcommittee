import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq, sql as rawSql } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { sections } from '../../db/schema.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { reorderSchema, sectionCreateSchema, sectionUpdateSchema } from '../_lib/schema.js';
import { serializeSection } from '../_lib/serialize.js';

async function list(req: VercelRequest, res: VercelResponse) {
  // Full list (including hidden) is admin-only; the public site reads /api/site instead.
  await requireSession(req);
  const rows = await db().select().from(sections).orderBy(asc(sections.orderIndex), asc(sections.createdAt));
  json(res, 200, rows.map(serializeSection));
}

async function create(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const data = sectionCreateSchema.parse(req.body);
  const rows = await db().insert(sections).values({
    type: data.type,
    title: data.title,
    subtitle: data.subtitle,
    visible: data.visible,
    accent: data.accent,
    config: data.config,
    orderIndex: rawSql`(select coalesce(max(order_index), -1) + 1 from sections)`,
  }).returning();
  json(res, 201, serializeSection(rows[0]));
}

async function reorder(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const { order } = reorderSchema.parse(req.body);

  await Promise.all(
    order.map((id, index) => db().update(sections).set({ orderIndex: index }).where(eq(sections.id, id))),
  );

  const rows = await db().select().from(sections).orderBy(asc(sections.orderIndex), asc(sections.createdAt));
  json(res, 200, rows.map(serializeSection));
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const patch = sectionUpdateSchema.parse(req.body);

  const existingRows = await db().select().from(sections).where(eq(sections.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'Section not found');

  const rows = await db().update(sections).set({
    type: patch.type ?? existing.type,
    title: patch.title ?? existing.title,
    subtitle: patch.subtitle ?? existing.subtitle,
    visible: patch.visible ?? existing.visible,
    accent: patch.accent ?? existing.accent,
    orderIndex: patch.order_index ?? existing.orderIndex,
    config: patch.config ?? existing.config,
    updatedAt: new Date(),
  }).where(eq(sections.id, id)).returning();
  json(res, 200, serializeSection(rows[0]));
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await db().delete(sections).where(eq(sections.id, id)).returning({ id: sections.id });
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
