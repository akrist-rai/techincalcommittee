import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { sql } from '../_lib/db.js';
import { requireSession } from '../_lib/auth.js';
import { HttpError, getIdParam, json, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { mediaMetaSchema } from '../_lib/schema.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const id = getIdParam(req);

  if (req.method === 'PUT') {
    await requireSession(req);
    const { alt_text } = mediaMetaSchema.parse(req.body);
    const rows = await sql()`update images set alt_text = ${alt_text} where id = ${id} returning *`;
    if (rows.length === 0) throw new HttpError(404, 'Image not found');
    return json(res, 200, rows[0]);
  }

  if (req.method === 'DELETE') {
    await requireSession(req);
    const rows = await sql()`delete from images where id = ${id} returning url`;
    if (rows.length === 0) throw new HttpError(404, 'Image not found');

    const url = rows[0].url as string;
    if (url.includes('.blob.vercel-storage.com')) {
      await del(url).catch(() => undefined);
    }
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
