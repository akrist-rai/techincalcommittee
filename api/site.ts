import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq } from 'drizzle-orm';
import { db } from './_lib/db.js';
import {
  clubs, events, members, sections,
} from '../db/schema.js';
import { json, methodNotAllowed, withErrorHandling } from './_lib/http.js';
import {
  serializeClub, serializeEvent, serializeMember, serializeSection,
} from './_lib/serialize.js';

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const [sectionRows, memberRows, eventRows, clubRows] = await Promise.all([
    db().select().from(sections).where(eq(sections.visible, true)).orderBy(asc(sections.orderIndex), asc(sections.createdAt)),
    db().select().from(members).orderBy(asc(members.orderIndex), asc(members.createdAt)),
    db().select().from(events).orderBy(asc(events.orderIndex), asc(events.createdAt)),
    db().select().from(clubs).orderBy(asc(clubs.orderIndex), asc(clubs.createdAt)),
  ]);

  const allMembers = memberRows.map(serializeMember);
  const allEvents = eventRows.map(serializeEvent);

  const clubsWithRoster = clubRows.map((c) => ({
    ...serializeClub(c),
    members: allMembers.filter((m) => m.club_id === c.id),
    events: allEvents.filter((e) => e.club_id === c.id),
  }));

  const enriched = sectionRows.map((s) => {
    const base = serializeSection(s);
    if (s.type === 'members') return { ...base, items: allMembers };
    if (s.type === 'events') return { ...base, items: allEvents };
    if (s.type === 'clubs') return { ...base, items: clubsWithRoster };
    return base;
  });

  res.setHeader('cache-control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300');
  json(res, 200, { sections: enriched });
});
