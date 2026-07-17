-- Committee site schema. Idempotent: safe to run repeatedly.
-- Run via `npm run db:migrate`.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_expires_at_idx on sessions(expires_at);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  img_url text not null default '',
  quote text,
  stats jsonb not null default '[]',
  size text not null default 'md' check (size in ('wide', 'lg', 'md', 'sm')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  chapter text not null default '',
  page text not null default '',
  title text not null,
  tag text not null default '',
  date_label text not null default '',
  description text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt_text text not null default '',
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('members', 'events', 'stats', 'custom')),
  title text not null default '',
  subtitle text not null default '',
  order_index integer not null default 0,
  visible boolean not null default true,
  accent text not null default 'red' check (accent in ('red', 'cyan', 'yellow', 'violet', 'green')),
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- covers tables created before `accent` existed
alter table sections add column if not exists accent text not null default 'red'
  check (accent in ('red', 'cyan', 'yellow', 'violet', 'green'));

create index if not exists sections_order_idx on sections(order_index);
