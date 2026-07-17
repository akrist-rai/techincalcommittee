import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';

export const config = { api: { bodyParser: false } };

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

async function readBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BYTES) throw new HttpError(413, 'File too large (max 8MB)');
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

function sanitizeFilename(name: string): string {
  const base = name.split('/').pop()?.split('\\').pop() ?? 'upload';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
  return cleaned || 'upload';
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    await requireSession(req);
    const rows = await sql()`select * from images order by created_at desc`;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    const user = await requireSession(req);

    const contentType = req.headers['content-type'] ?? '';
    if (!ALLOWED_TYPES.has(contentType)) {
      throw new HttpError(415, 'Unsupported file type. Use JPEG, PNG, WEBP, GIF, or AVIF.');
    }

    const filenameParam = req.query.filename;
    const filename = sanitizeFilename(typeof filenameParam === 'string' ? filenameParam : 'upload');
    const body = await readBody(req);
    if (body.length === 0) throw new HttpError(400, 'Empty file');

    const key = `uploads/${crypto.randomUUID()}-${filename}`;
    const blob = await put(key, body, { access: 'public', contentType });

    const rows = await sql()`
      insert into images (url, alt_text, uploaded_by)
      values (${blob.url}, ${filename}, ${user.id})
      returning *
    `;
    return json(res, 201, rows[0]);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
