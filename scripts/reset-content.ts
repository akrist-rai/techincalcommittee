// Replaces members/events/sections with the current defaults from
// content.ts — unlike seed.ts this is NOT idempotent-guarded, it always
// overwrites. Leaves users and the media library untouched. Use this after
// changing content.ts to push a content refresh to a DB that's already been
// seeded once (seed.ts's empty-table guard would otherwise no-op).
import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { EVENTS, MEMBERS, SECTIONS } from './content.js';

neonConfig.webSocketConstructor = ws;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set.');

  const client = new Client(databaseUrl);
  await client.connect();

  try {
    await client.query('delete from sections');
    await client.query('delete from events');
    await client.query('delete from members');

    for (let i = 0; i < MEMBERS.length; i++) {
      const m = MEMBERS[i];
      await client.query(
        `insert into members (name, role, img_url, quote, stats, size, order_index)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [m.name, m.role, m.img_url, m.quote, JSON.stringify(m.stats), m.size, i],
      );
    }
    console.log(`Reset: ${MEMBERS.length} members.`);

    for (let i = 0; i < EVENTS.length; i++) {
      const e = EVENTS[i];
      await client.query(
        `insert into events (chapter, page, title, tag, date_label, description, order_index)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [e.chapter, e.page, e.title, e.tag, e.date_label, e.description, i],
      );
    }
    console.log(`Reset: ${EVENTS.length} events.`);

    for (let i = 0; i < SECTIONS.length; i++) {
      const s = SECTIONS[i];
      await client.query(
        `insert into sections (type, title, subtitle, order_index, visible, accent, config)
         values ($1, $2, $3, $4, true, $5, $6)`,
        [s.type, s.title, s.subtitle, i, s.accent, JSON.stringify(s.config)],
      );
    }
    console.log(`Reset: ${SECTIONS.length} sections.`);

    console.log('Content reset complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
