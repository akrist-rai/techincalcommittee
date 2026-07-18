import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../db/schema.js';
import {
  CLUBS, EVENTS, MEDIA_BUILTINS, MEMBERS, SECTIONS,
} from './content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set.');
  if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL / ADMIN_BOOTSTRAP_PASSWORD are not set.');

  const db = drizzle(neon(databaseUrl), { schema });

  // -- bootstrap admin (safe to re-run: does nothing if the email exists) --
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.insert(schema.users)
    .values({ email: adminEmail.toLowerCase(), name: 'Admin', passwordHash, role: 'admin' })
    .onConflictDoNothing({ target: schema.users.email });
  console.log(`Bootstrap admin ready: ${adminEmail}`);

  // -- media library: built-in curated + full scraped-art pool --
  const [{ value: imageCount }] = await db.select({ value: count() }).from(schema.images);
  if (imageCount === 0) {
    const manifestPath = path.join(root, 'db', 'media-manifest.json');
    const manifest: { url: string; slug: string }[] = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const libraryImages = manifest.map((m) => ({ url: m.url, altText: m.slug }));
    const all = [...MEDIA_BUILTINS.map((m) => ({ url: m.url, altText: m.alt_text })), ...libraryImages];
    await db.insert(schema.images).values(all);
    console.log(`Seeded ${all.length} media library rows.`);
  } else {
    console.log('Media library already has rows, skipping image seed.');
  }

  // -- clubs --
  const [{ value: clubCount }] = await db.select({ value: count() }).from(schema.clubs);
  let clubIdBySlug = new Map<string, string>();
  if (clubCount === 0) {
    const inserted = await db.insert(schema.clubs).values(CLUBS.map((c, i) => ({
      name: c.name, slug: c.slug, tagline: c.tagline, description: c.description,
      imgUrl: c.img_url, accent: c.accent, orderIndex: i,
    }))).returning({ id: schema.clubs.id, slug: schema.clubs.slug });
    clubIdBySlug = new Map(inserted.map((c) => [c.slug, c.id]));
    console.log(`Seeded ${CLUBS.length} clubs.`);
  } else {
    const existing = await db.select({ id: schema.clubs.id, slug: schema.clubs.slug }).from(schema.clubs);
    clubIdBySlug = new Map(existing.map((c) => [c.slug, c.id]));
    console.log('Clubs already exist, skipping.');
  }

  // -- members --
  const [{ value: memberCount }] = await db.select({ value: count() }).from(schema.members);
  if (memberCount === 0) {
    await db.insert(schema.members).values(MEMBERS.map((m, i) => ({
      clubId: clubIdBySlug.get(m.clubSlug) ?? null,
      name: m.name, role: m.role, imgUrl: m.img_url, quote: m.quote, stats: m.stats, size: m.size, orderIndex: i,
    })));
    console.log(`Seeded ${MEMBERS.length} members.`);
  } else {
    console.log('Members already exist, skipping.');
  }

  // -- events --
  const [{ value: eventCount }] = await db.select({ value: count() }).from(schema.events);
  if (eventCount === 0) {
    await db.insert(schema.events).values(EVENTS.map((e, i) => ({
      clubId: e.clubSlug ? (clubIdBySlug.get(e.clubSlug) ?? null) : null,
      chapter: e.chapter, page: e.page, title: e.title, tag: e.tag, dateLabel: e.date_label,
      description: e.description, imgUrl: e.img_url, orderIndex: i,
    })));
    console.log(`Seeded ${EVENTS.length} events.`);
  } else {
    console.log('Events already exist, skipping.');
  }

  // -- sections --
  const [{ value: sectionCount }] = await db.select({ value: count() }).from(schema.sections);
  if (sectionCount === 0) {
    await db.insert(schema.sections).values(SECTIONS.map((s, i) => ({
      type: s.type, title: s.title, subtitle: s.subtitle, orderIndex: i, visible: true, accent: s.accent, config: s.config,
    })));
    console.log(`Seeded ${SECTIONS.length} sections.`);
  } else {
    console.log('Sections already exist, skipping.');
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
