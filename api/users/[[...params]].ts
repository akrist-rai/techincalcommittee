import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { requireAdmin, type AuthUser } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { userCreateSchema, userUpdateSchema } from '../_lib/schema.js';

async function countAdmins(): Promise<number> {
  const rows = await sql()`select count(*)::int as count from users where role = 'admin'`;
  return (rows[0] as { count: number }).count;
}

async function list(res: VercelResponse) {
  const rows = await sql()`
    select id, email, name, role, created_at, last_login_at from users order by created_at asc
  `;
  json(res, 200, rows);
}

async function create(req: VercelRequest, res: VercelResponse) {
  const data = userCreateSchema.parse(req.body);

  const existing = await sql()`select id from users where email = ${data.email} limit 1`;
  if (existing.length > 0) throw new HttpError(409, 'A user with that email already exists');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const rows = await sql()`
    insert into users (email, name, password_hash, role)
    values (${data.email}, ${data.name}, ${passwordHash}, ${data.role})
    returning id, email, name, role, created_at, last_login_at
  `;
  json(res, 201, rows[0]);
}

async function update(req: VercelRequest, res: VercelResponse, admin: AuthUser, id: string) {
  const patch = userUpdateSchema.parse(req.body);

  const existingRows = await sql()`select * from users where id = ${id} limit 1`;
  const existing = existingRows[0] as { id: string; name: string; role: string } | undefined;
  if (!existing) throw new HttpError(404, 'User not found');

  if (existing.id === admin.id && patch.role && patch.role !== 'admin') {
    throw new HttpError(400, 'You cannot demote your own account');
  }
  if (existing.role === 'admin' && patch.role === 'editor' && (await countAdmins()) <= 1) {
    throw new HttpError(400, 'At least one admin must remain');
  }

  const name = patch.name ?? existing.name;
  const role = patch.role ?? existing.role;
  const passwordHash = patch.password ? await bcrypt.hash(patch.password, 12) : undefined;

  const rows = passwordHash
    ? await sql()`
        update users set name = ${name}, role = ${role}, password_hash = ${passwordHash}
        where id = ${id} returning id, email, name, role, created_at, last_login_at
      `
    : await sql()`
        update users set name = ${name}, role = ${role}
        where id = ${id} returning id, email, name, role, created_at, last_login_at
      `;
  json(res, 200, rows[0]);
}

async function remove(res: VercelResponse, admin: AuthUser, id: string) {
  if (id === admin.id) throw new HttpError(400, 'You cannot delete your own account');

  const existingRows = await sql()`select role from users where id = ${id} limit 1`;
  const existing = existingRows[0] as { role: string } | undefined;
  if (!existing) throw new HttpError(404, 'User not found');
  if (existing.role === 'admin' && (await countAdmins()) <= 1) {
    throw new HttpError(400, 'At least one admin must remain');
  }

  await sql()`delete from users where id = ${id}`;
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
