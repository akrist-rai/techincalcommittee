import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { createSession } from '../_lib/auth.js';
import { HttpError, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { loginSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const { email, password } = loginSchema.parse(req.body);

  const rows = await sql()`
    select id, email, name, password_hash, role from users where email = ${email.toLowerCase()} limit 1
  `;
  const user = rows[0] as { id: string; email: string; name: string; password_hash: string; role: string } | undefined;
  if (!user) throw new HttpError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new HttpError(401, 'Invalid email or password');

  await createSession(res, user.id);
  await sql()`update users set last_login_at = now() where id = ${user.id}`;

  json(res, 200, { id: user.id, email: user.email, name: user.name, role: user.role });
});
