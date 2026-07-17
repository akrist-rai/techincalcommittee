import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { HttpError, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { userCreateSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  await requireAdmin(req);

  if (req.method === 'GET') {
    const rows = await sql()`
      select id, email, name, role, created_at, last_login_at from users order by created_at asc
    `;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    const data = userCreateSchema.parse(req.body);

    const existing = await sql()`select id from users where email = ${data.email} limit 1`;
    if (existing.length > 0) throw new HttpError(409, 'A user with that email already exists');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const rows = await sql()`
      insert into users (email, name, password_hash, role)
      values (${data.email}, ${data.name}, ${passwordHash}, ${data.role})
      returning id, email, name, role, created_at, last_login_at
    `;
    return json(res, 201, rows[0]);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
