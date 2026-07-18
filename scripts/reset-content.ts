// Replaces clubs/members/events/sections with the current defaults from
// content.ts — unlike seed.ts this is NOT idempotent-guarded, it always
// overwrites. Leaves users and the media library untouched. Use this after
// changing content.ts to push a content refresh to a DB that's already been
// seeded once (seed.ts's empty-table guard would otherwise no-op).
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema.js';
import {
  CLUBS, EVENTS, MEMBERS, SECTIONS,
} from './content.js';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set.');

  const db = drizzle(neon(databaseUrl), { schema });

  await db.delete(schema.sections);
  await db.delete(schema.events);
  await db.delete(schema.members);
  await db.delete(schema.clubs);

  const insertedClubs = await db.insert(schema.clubs).values(CLUBS.map((c, i) => ({
    name: c.name, slug: c.slug, tagline: c.tagline, description: c.description,
    imgUrl: c.img_url, accent: c.accent, orderIndex: i,
  }))).returning({ id: schema.clubs.id, slug: schema.clubs.slug });
  const clubIdBySlug = new Map(insertedClubs.map((c) => [c.slug, c.id]));
  console.log(`Reset: ${CLUBS.length} clubs.`);

  await db.insert(schema.members).values(MEMBERS.map((m, i) => ({
    clubId: clubIdBySlug.get(m.clubSlug) ?? null,
    name: m.name, role: m.role, imgUrl: m.img_url, quote: m.quote, stats: m.stats, size: m.size, orderIndex: i,
  })));
  console.log(`Reset: ${MEMBERS.length} members.`);

  await db.insert(schema.events).values(EVENTS.map((e, i) => ({
    clubId: e.clubSlug ? (clubIdBySlug.get(e.clubSlug) ?? null) : null,
    chapter: e.chapter, page: e.page, title: e.title, tag: e.tag, dateLabel: e.date_label,
    description: e.description, imgUrl: e.img_url, orderIndex: i,
  })));
  console.log(`Reset: ${EVENTS.length} events.`);

  await db.insert(schema.sections).values(SECTIONS.map((s, i) => ({
    type: s.type, title: s.title, subtitle: s.subtitle, orderIndex: i, visible: true, accent: s.accent, config: s.config,
  })));
  console.log(`Reset: ${SECTIONS.length} sections.`);

  console.log('Content reset complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
