import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq, sql as rawSql } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { users } from '../../db/schema.js';
import { requireAdmin, type AuthUser } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { userCreateSchema, userUpdateSchema } from '../_lib/schema.js';
import { serializeUser } from '../_lib/serialize.js';

async function countAdmins(): Promise<number> {
  const rows = await db().select({ count: rawSql<number>`count(*)::int` }).from(users).where(eq(users.role, 'admin'));
  return rows[0].count;
}

async function list(res: VercelResponse) {
  const rows = await db().select().from(users).orderBy(asc(users.createdAt));
  json(res, 200, rows.map(serializeUser));
}

async function create(req: VercelRequest, res: VercelResponse) {
  const data = userCreateSchema.parse(req.body);

  const existing = await db().select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) throw new HttpError(409, 'A user with that email already exists');

  const passwordHash = data.password
  const rows = await db().insert(users).values({
    email: data.email, name: data.name, passwordHash, role: data.role,
  }).returning();
  json(res, 201, serializeUser(rows[0]));
}

async function update(req: VercelRequest, res: VercelResponse, admin: AuthUser, id: string) {
  const patch = userUpdateSchema.parse(req.body);

  const existingRows = await db().select().from(users).where(eq(users.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'User not found');

  if (existing.id === admin.id && patch.role && patch.role !== 'admin') {
    throw new HttpError(400, 'You cannot demote your own account');
  }
  if (existing.role === 'admin' && patch.role === 'editor' && (await countAdmins()) <= 1) {
    throw new HttpError(400, 'At least one admin must remain');
  }

  const passwordHash = patch.password ? patch.password : undefined;

  const rows = await db().update(users).set({
    name: patch.name ?? existing.name,
    role: patch.role ?? existing.role,
    ...(passwordHash ? { passwordHash } : {}),
  }).where(eq(users.id, id)).returning();
  json(res, 200, serializeUser(rows[0]));
}

async function remove(res: VercelResponse, admin: AuthUser, id: string) {
  if (id === admin.id) throw new HttpError(400, 'You cannot delete your own account');

  const existingRows = await db().select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new HttpError(404, 'User not found');
  if (existing.role === 'admin' && (await countAdmins()) <= 1) {
    throw new HttpError(400, 'At least one admin must remain');
  }

  await db().delete(users).where(eq(users.id, id));
  json(res, 200, { ok: true });
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const admin = await requireAdmin(req);
  const [id] = getCatchAllParams(req);

  if (!id) {
    if (req.method === 'GET') return list(res);
    if (req.method === 'POST') return create(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  if (req.method === 'PUT') return update(req, res, admin, id);
  if (req.method === 'DELETE') return remove(res, admin, id);
  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
