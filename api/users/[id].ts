import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { HttpError, getIdParam, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { userUpdateSchema } from '../_lib/schema.js';

async function countAdmins(): Promise<number> {
  const rows = await sql()`select count(*)::int as count from users where role = 'admin'`;
  return (rows[0] as { count: number }).count;
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const admin = await requireAdmin(req);
  const id = getIdParam(req);

  if (req.method === 'PUT') {
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
    return json(res, 200, rows[0]);
  }

  if (req.method === 'DELETE') {
    if (id === admin.id) throw new HttpError(400, 'You cannot delete your own account');

    const existingRows = await sql()`select role from users where id = ${id} limit 1`;
    const existing = existingRows[0] as { role: string } | undefined;
    if (!existing) throw new HttpError(404, 'User not found');
    if (existing.role === 'admin' && (await countAdmins()) <= 1) {
      throw new HttpError(400, 'At least one admin must remain');
    }

    await sql()`delete from users where id = ${id}`;
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
