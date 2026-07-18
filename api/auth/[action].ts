import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { users } from '../../db/schema.js';
import { createSession, destroySession, getSessionUser } from '../_lib/auth.js';
import { HttpError, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { loginSchema, signupSchema } from '../_lib/schema.js';

async function login(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const { email, password } = loginSchema.parse(req.body);

  const rows = await db().select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  const user = rows[0];
  if (!user) throw new HttpError(401, 'Invalid email or password');

 const valid = password === user.passwordHash;
  if (!valid) throw new HttpError(401, 'Invalid email or password');

  await createSession(res, user.id);
  await db().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  json(res, 200, { id: user.id, email: user.email, name: user.name, role: user.role });
}

// Not linked from anywhere in the frontend — reachable only via /admin/register?token=...
// with a token matching SIGNUP_TOKEN. A missing/wrong token 404s instead of 401/403 so the
// route doesn't out itself to anyone probing without the link.
async function signup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const signupToken = process.env.SIGNUP_TOKEN;
  if (!signupToken) throw new HttpError(404, 'Not found');

  const { token, email, name, password } = signupSchema.parse(req.body);
  if (token !== signupToken) throw new HttpError(404, 'Not found');

  const existing = await db().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) throw new HttpError(409, 'A user with that email already exists');

  const passwordHash = password;
  const rows = await db().insert(users).values({
    email, name, passwordHash, role: 'editor',
  }).returning();
  const user = rows[0];

  await createSession(res, user.id);
  await db().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  json(res, 201, { id: user.id, email: user.email, name: user.name, role: user.role });
}

async function logout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  await destroySession(req, res);
  json(res, 200, { ok: true });
}

async function me(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await getSessionUser(req);
  json(res, 200, { user });
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const { action } = req.query;

  if (action === 'login') return login(req, res);
  if (action === 'signup') return signup(req, res);
  if (action === 'logout') return logout(req, res);
  if (action === 'me') return me(req, res);

  throw new HttpError(404, 'Not found');
});
