import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import { sql } from './db.js';
import { HttpError } from './http.js';

const COOKIE_NAME = 'session';
const SESSION_DAYS = 30;

export type Role = 'admin' | 'editor';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isProd(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export async function createSession(res: VercelResponse, userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await sql()`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  res.setHeader(
    'set-cookie',
    serializeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    }),
  );
}

export async function destroySession(req: VercelRequest, res: VercelResponse): Promise<void> {
  const token = getSessionToken(req);
  if (token) {
    await sql()`delete from sessions where token_hash = ${hashToken(token)}`;
  }
  res.setHeader(
    'set-cookie',
    serializeCookie(COOKIE_NAME, '', { httpOnly: true, secure: isProd(), sameSite: 'lax', path: '/', maxAge: 0 }),
  );
}

function getSessionToken(req: VercelRequest): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = parseCookie(header);
  return cookies[COOKIE_NAME] ?? null;
}

export async function getSessionUser(req: VercelRequest): Promise<AuthUser | null> {
  const token = getSessionToken(req);
  if (!token) return null;

  const rows = await sql()`
    select u.id, u.email, u.name, u.role
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()
    limit 1
  `;
  const row = rows[0] as AuthUser | undefined;
  return row ?? null;
}

export async function requireSession(req: VercelRequest): Promise<AuthUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, 'Not signed in');
  return user;
}

export async function requireAdmin(req: VercelRequest): Promise<AuthUser> {
  const user = await requireSession(req);
  if (user.role !== 'admin') {
    throw new HttpError(403, 'Admins only');
  }
  return user;
}
