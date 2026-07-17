import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { del, put } from '@vercel/blob';
import { desc, eq } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { images } from '../../db/schema.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getCatchAllParams, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { mediaMetaSchema } from '../_lib/schema.js';
import { serializeImage } from '../_lib/serialize.js';

// Whole file (index + [id] collapsed together, see getCatchAllParams) runs
// with the parsed-JSON body parser off, since uploads need the raw byte
// stream — PUT (alt-text edit) reads and JSON.parses that same raw stream itself.
export const config = { api: { bodyParser: false } };

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) throw new HttpError(413, 'File too large (max 8MB)');
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  const buf = await readRawBody(req);
  if (buf.length === 0) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

function sanitizeFilename(name: string): string {
  const base = name.split('/').pop()?.split('\\').pop() ?? 'upload';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
  return cleaned || 'upload';
}

async function list(res: VercelResponse) {
  const rows = await db().select().from(images).orderBy(desc(images.createdAt));
  json(res, 200, rows.map(serializeImage));
}

async function upload(req: VercelRequest, res: VercelResponse) {
  const user = await requireSession(req);

  const contentType = req.headers['content-type'] ?? '';
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new HttpError(415, 'Unsupported file type. Use JPEG, PNG, WEBP, GIF, or AVIF.');
  }

  const filenameParam = req.query.filename;
  const filename = sanitizeFilename(typeof filenameParam === 'string' ? filenameParam : 'upload');
  const body = await readRawBody(req);
  if (body.length === 0) throw new HttpError(400, 'Empty file');

  const key = `uploads/${crypto.randomUUID()}-${filename}`;
  const blob = await put(key, body, { access: 'public', contentType });

  const rows = await db().insert(images).values({
    url: blob.url, altText: filename, uploadedBy: user.id,
  }).returning();
  json(res, 201, serializeImage(rows[0]));
}

async function updateAlt(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const body = await readJsonBody(req);
  const { alt_text } = mediaMetaSchema.parse(body);
  const rows = await db().update(images).set({ altText: alt_text }).where(eq(images.id, id)).returning();
  if (rows.length === 0) throw new HttpError(404, 'Image not found');
  json(res, 200, serializeImage(rows[0]));
}

async function remove(req: VercelRequest, res: VercelResponse, id: string) {
  await requireSession(req);
  const rows = await db().delete(images).where(eq(images.id, id)).returning({ url: images.url });
  if (rows.length === 0) throw new HttpError(404, 'Image not found');

  const url = rows[0].url;
  if (url.includes('.blob.vercel-storage.com')) {
    await del(url).catch(() => undefined);
  }
  json(res, 200, { ok: true });
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const [id] = getCatchAllParams(req);

  if (!id) {
    if (req.method === 'GET') { await requireSession(req); return list(res); }
    if (req.method === 'POST') return upload(req, res);
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  if (req.method === 'PUT') return updateAlt(req, res, id);
  if (req.method === 'DELETE') return remove(req, res, id);
  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
