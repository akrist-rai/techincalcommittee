# Technical Committee — manga site + CMS

A React + Vite site for the Technical Committee, styled like a manga volume
(continuous panel-scroll, halftone/screentone textures, chapter-index framing)
with a real backend: Neon Postgres, cookie-based auth with per-member accounts,
and an admin panel at `/admin` where editors can rewrite content, manage clubs
and their rosters, and add, remove, and reorder page sections without touching
code.

## Stack

- **Frontend**: Vite + React + TypeScript, `react-router-dom` for `/` (public site) and `/admin/*`.
- **Backend**: Vercel Serverless Functions under `api/*.ts` — no separate server to host. Routes are
  consolidated into catch-all files per resource (Vercel's Hobby plan caps a deployment at 12 functions).
- **Database**: Neon Postgres via Drizzle ORM (`drizzle-orm/neon-http`). Schema lives in `db/schema.ts`.
- **Auth**: email + password, bcrypt hashing, DB-backed sessions in an `httpOnly` cookie (not stateless JWT, so access can be revoked instantly).
- **Images**: Vercel Blob for uploads; a curated ~60-image art library is seeded in as a starting media library.

## One-time setup

You'll need a [Neon](https://neon.tech) project and a [Vercel](https://vercel.com) project with Blob storage enabled. Both have free tiers that are plenty for this.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Neon project** at [neon.tech](https://neon.tech), then copy the **pooled** connection string (Neon dashboard → Connect → Pooled connection).

3. **Set up your env file**

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL` with the Neon connection string. Pick your own
   `ADMIN_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` — these create the first admin
   login (change the password from the admin panel afterward).

4. **Push the schema, then seed starter content**

   ```bash
   npm run db:push
   npm run db:seed
   ```

   `db:push` (Drizzle Kit) diffs `db/schema.ts` against the live database and
   applies the difference — no migration files to manage. The seed is
   idempotent per-table — re-running it won't duplicate clubs, members,
   events, or sections that already exist, and won't overwrite the bootstrap
   admin's password if that account already exists. If you change
   `scripts/content.ts` later and want to push a content refresh to a DB
   that's already seeded, use `npm run db:reset-content` instead (destructive:
   replaces clubs/members/events/sections wholesale, leaves users and the
   media library alone).

5. **Enable Vercel Blob storage** on your Vercel project (Project → Storage →
   Create Database → Blob), copy the `BLOB_READ_WRITE_TOKEN` it gives you into
   `.env`. This is only needed for image uploads through the admin panel —
   everything else works without it.

6. **Link the project to Vercel** (needed once, so `vercel dev` can find your env vars):

   ```bash
   npx vercel link
   npx vercel env pull .env.development.local   # optional: sync any env vars you've set in the Vercel dashboard
   ```

## Local development

```bash
npm run dev:full
```

This runs `vercel dev`, which serves the Vite frontend **and** the `/api/*`
serverless functions together (same as production). It reads env vars from
`.env`. First run will prompt you to link/create a Vercel project if you
skipped step 6 above — say yes, it doesn't deploy anything.

(It's `dev:full` and not plain `dev` because Vercel's CLI refuses to run
`vercel dev` if it finds `package.json`'s `dev` script is also `vercel dev` —
it looks like self-recursion to it.)

Visit the printed local URL, then go to `/admin/login` and sign in with the
`ADMIN_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` you set during seeding.

If you only need the frontend (no API, e.g. quick CSS iteration), plain `npm
run dev` runs Vite by itself — but anything that hits `/api/*` (which is most
of the site now) won't work there.

## Content model

Everything you see on `/` is driven by **sections** (`sections` table),
managed from `/admin`:

- **Clubs** sections show a grid of every club (`clubs` table); each club gets
  its own page at `/club/:slug` with its roster and event plans, filtered from
  the shared `members`/`events` tables by `club_id`. Manage clubs from the
  **Clubs** tab; assign a member or event to a club from the **Members** /
  **Events** tabs (or leave it committee-wide).
- **Members** and **Events** section types render the full roster / timeline
  (unfiltered, across every club) from the `members` and `events` tables.
- **Stats** sections hold numeric stats + achievement badges directly.
- **Custom** sections are freeform text+image panels — with a `variant` field
  that also covers the hero cover panel, the "About" panel (always shown on
  Home instead of getting its own nav page), and the finale/CTA panel, so all
  of those are editable and removable like any other section, not hardcoded chrome.

Add, delete, hide, and reorder sections from the **Sections** tab in
`/admin` — the public page (and its nav) reflects that instantly.

Two roles: **admin** (content + can manage other users) and **editor**
(content only). Only admins can create/remove accounts, from the **Users** tab.

## A note on the image library

`public/library/` (~60 images) was carried over from art already sitting in
this repo's `/images` folder. It's fan art scraped from artists' social posts,
not licensed stock — filenames like `by-lazlo.jpeg` are literally the
attribution the original post carried. Using it here was a deliberate choice
made by the project owner despite that; if this site becomes more public or
official, swap out anything you're not comfortable publishing under someone
else's name via the Media tab.

## Deploying

```bash
npx vercel deploy
```

Before (or after) your first deploy, add `DATABASE_URL` and
`BLOB_READ_WRITE_TOKEN` under the Vercel project's **Settings → Environment
Variables** (production + preview). `npm run db:push` / `npm run db:seed`
are one-time setup commands you run locally against the same `DATABASE_URL` —
they're not part of the build.

If a production deploy fails at "Deploying outputs" with no build error,
you've likely gone back over Vercel's function-count limit (12 on Hobby) by
adding a new top-level file under `api/`. Prefer adding a case to an existing
catch-all route (`api/<resource>/[[...params]].ts`) over a new file, and if a
route needs to be reachable at its bare path (no trailing segment), add a
rewrite for it in `vercel.json` pointing at `.../_root` — `getCatchAllParams`
in `api/_lib/http.ts` strips that sentinel automatically.
