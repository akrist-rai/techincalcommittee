import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';
import { EVENTS, MEDIA_BUILTINS, MEMBERS, SECTIONS } from './content.js';

neonConfig.webSocketConstructor = ws;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set.');
  if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL / ADMIN_BOOTSTRAP_PASSWORD are not set.');

  const client = new Client(databaseUrl);
  await client.connect();

  try {
    // -- bootstrap admin (safe to re-run: does nothing if the email exists) --
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await client.query(
      `insert into users (email, name, password_hash, role)
       values ($1, $2, $3, 'admin')
       on conflict (email) do nothing`,
      [adminEmail.toLowerCase(), 'Admin', passwordHash],
    );
    console.log(`Bootstrap admin ready: ${adminEmail}`);

    // -- media library: built-in curated + full scraped-art pool --
    const { rows: imageCountRows } = await client.query('select count(*)::int as count from images');
    if (imageCountRows[0].count === 0) {
      const manifestPath = path.join(root, 'db', 'media-manifest.json');
      const manifest: { url: string; slug: string }[] = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const libraryImages = manifest.map((m) => ({ url: m.url, alt_text: m.slug }));

      const all = [...MEDIA_BUILTINS, ...libraryImages];
      for (const img of all) {
        await client.query('insert into images (url, alt_text) values ($1, $2)', [img.url, img.alt_text]);
      }
      console.log(`Seeded ${all.length} media library rows.`);
    } else {
      console.log('Media library already has rows, skipping image seed.');
    }

    // -- members --
    const { rows: memberCountRows } = await client.query('select count(*)::int as count from members');
    if (memberCountRows[0].count === 0) {
      for (let i = 0; i < MEMBERS.length; i++) {
        const m = MEMBERS[i];
        await client.query(
          `insert into members (name, role, img_url, quote, stats, size, order_index)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [m.name, m.role, m.img_url, m.quote, JSON.stringify(m.stats), m.size, i],
        );
      }
      console.log(`Seeded ${MEMBERS.length} members.`);
    } else {
      console.log('Members already exist, skipping.');
    }

    // -- events --
    const { rows: eventCountRows } = await client.query('select count(*)::int as count from events');
    if (eventCountRows[0].count === 0) {
      for (let i = 0; i < EVENTS.length; i++) {
        const e = EVENTS[i];
        await client.query(
          `insert into events (chapter, page, title, tag, date_label, description, order_index)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [e.chapter, e.page, e.title, e.tag, e.date_label, e.description, i],
        );
      }
      console.log(`Seeded ${EVENTS.length} events.`);
    } else {
      console.log('Events already exist, skipping.');
    }

    // -- sections --
    const { rows: sectionCountRows } = await client.query('select count(*)::int as count from sections');
    if (sectionCountRows[0].count === 0) {
      for (let i = 0; i < SECTIONS.length; i++) {
        const s = SECTIONS[i];
        await client.query(
          `insert into sections (type, title, subtitle, order_index, visible, accent, config)
           values ($1, $2, $3, $4, true, $5, $6)`,
          [s.type, s.title, s.subtitle, i, s.accent, JSON.stringify(s.config)],
        );
      }
      console.log(`Seeded ${SECTIONS.length} sections.`);
    } else {
      console.log('Sections already exist, skipping.');
    }

    console.log('Seed complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
