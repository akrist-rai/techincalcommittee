import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_lib/db.js';
import { json, methodNotAllowed, withErrorHandling } from './_lib/http.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const [sections, members, events] = await Promise.all([
    sql()`
      select id, type, title, subtitle, accent, config
      from sections where visible = true
      order by order_index asc, created_at asc
    `,
    sql()`select * from members order by order_index asc, created_at asc`,
    sql()`select * from events order by order_index asc, created_at asc`,
  ]);

  const enriched = sections.map((s) => {
    if (s.type === 'members') return { ...s, items: members };
    if (s.type === 'events') return { ...s, items: events };
    return s;
  });

  res.setHeader('cache-control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300');
  json(res, 200, { sections: enriched });
});
