// One-off utility: slugifies filenames in /images (which has messy names —
// spaces, unicode, social-media handles) and copies them into
// public/library/ as web-servable, URL-safe assets. Writes
// db/media-manifest.json describing each file for the seed script and the
// admin media library's "built-in" picks.
//
// Re-run is safe: it overwrites public/library and the manifest deterministically.

import { readdirSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'images');
const destDir = path.join(root, 'public', 'library');

mkdirSync(destDir, { recursive: true });

function slugify(base) {
  return base
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/@/g, 'at-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const files = readdirSync(srcDir).filter((f) => !f.startsWith('.'));
const seen = new Map();
const manifest = [];

for (const file of files) {
  const ext = '.jpeg';
  const base = file.replace(/\.[^.]+$/, '');
  let slug = slugify(base) || 'image';
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  if (count > 0) slug = `${slug}-${count + 1}`;

  const filename = `${slug}${ext}`;
  copyFileSync(path.join(srcDir, file), path.join(destDir, filename));
  manifest.push({ slug, filename, url: `/library/${filename}`, originalName: file });
}

manifest.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(
  path.join(root, 'db', 'media-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

console.log(`Copied ${manifest.length} images into public/library/ and wrote db/media-manifest.json`);
