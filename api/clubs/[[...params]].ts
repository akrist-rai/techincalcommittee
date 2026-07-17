import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq, sql as rawSql } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { clubs } from '../../db/schema.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { clubSchema, clubUpdateSchema } from '../_lib/schema.js';
import { serializeClub } from '../_lib/serialize.js';

async function assertSlugFree(slug: string, excludeId?: string) {
  const rows = excludeId
    ? await db().select({ id: clubs.id }).from(clubs).where(rawSql`${clubs.slug} = ${slug} and ${clubs.id} != ${excludeId}`).limit(1)
    : await db().select({ id: clubs.id }).from(clubs).where(eq(clubs.slug, slug)).limit(1);
  if (rows.length > 0) throw new HttpError(409, `A club already uses the slug "${slug}"`);
}

async function list(res: VercelResponse) {
  const rows = await db().select().from(clubs).orderBy(asc(clubs.orderIndex), asc(clubs.createdAt));
  json(res, 200, rows.map(serializeClub));
}

async function create(req: VercelRequest, res: VercelResponse) {
  await requireSession(req);
  const data = clubSchema.parse(req.body);
  await assertSlugFree(data.slug);
  const rows = await db().insert(clubs).values({
    name: data.name,
    slug: data.slug,
    tagline: data.tagline,
    description: data.description,
    imgUrl: data.img_url,
    accent: data.accent,
    orderIndex: rawSql`(select coalesce(max(order_index), -1) + 1 from clubs)`,
  }).returning();
  json(res, 201, serializeClub(rows[0]));
}

async function update(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const patch = clubUpdateSchema.parse(req.body);

  const existingRows = await db().select().from(clubs).where(eq(clubs.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'Club not found');

  const nextSlug = patch.slug ?? existing.slug;
  if (nextSlug !== existing.slug) await assertSlugFree(nextSlug, id);

  const rows = await db().update(clubs).set({
    name: patch.name ?? existing.name,
    slug: nextSlug,
    tagline: patch.tagline ?? existing.tagline,
    description: patch.description ?? existing.description,
    imgUrl: patch.img_url ?? existing.imgUrl,
    accent: patch.accent ?? existing.accent,
    orderIndex: patch.order_index ?? existing.orderIndex,
    updatedAt: new Date(),
  }).where(eq(clubs.id, id)).returning();
  json(res, 200, serializeClub(rows[0]));
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await db().delete(clubs).where(eq(clubs.id, id)).returning({ id: clubs.id });
  if (rows.length === 0) throw new HttpError(404, 'Club not found');
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
