import type { InferSelectModel } from 'drizzle-orm';
import type {
  clubs, events, images, members, sections, users,
} from '../../db/schema.js';

// Drizzle rows are camelCase (matching schema.ts field names); the JSON API
// contract (and the whole frontend already built against it) is snake_case.
// These keep that seam in one place instead of leaking camelCase outward.

export function serializeMember(m: InferSelectModel<typeof members>) {
  return {
    id: m.id,
    club_id: m.clubId,
    name: m.name,
    role: m.role,
    img_url: m.imgUrl,
    quote: m.quote,
    stats: m.stats,
    size: m.size,
    order_index: m.orderIndex,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

export function serializeEvent(e: InferSelectModel<typeof events>) {
  return {
    id: e.id,
    club_id: e.clubId,
    chapter: e.chapter,
    page: e.page,
    title: e.title,
    tag: e.tag,
    date_label: e.dateLabel,
    description: e.description,
    img_url: e.imgUrl,
    order_index: e.orderIndex,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

export function serializeClub(c: InferSelectModel<typeof clubs>) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    description: c.description,
    img_url: c.imgUrl,
    accent: c.accent,
    order_index: c.orderIndex,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export function serializeSection(s: InferSelectModel<typeof sections>) {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    subtitle: s.subtitle,
    order_index: s.orderIndex,
    visible: s.visible,
    accent: s.accent,
    config: s.config,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

export function serializeUser(u: Omit<InferSelectModel<typeof users>, 'passwordHash'>) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    created_at: u.createdAt,
    last_login_at: u.lastLoginAt,
  };
}

export function serializeImage(i: InferSelectModel<typeof images>) {
  return {
    id: i.id,
    url: i.url,
    alt_text: i.altText,
    uploaded_by: i.uploadedBy,
    created_at: i.createdAt,
  };
}
