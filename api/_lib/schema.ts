import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const statItemSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.number().finite(),
});

export const memberSchema = z.object({
  club_id: z.string().uuid().nullable().default(null),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).default(''),
  img_url: z.string().trim().max(2000).default(''),
  quote: z.string().trim().max(500).nullable().default(null),
  stats: z.array(statItemSchema).max(20).default([]),
  size: z.enum(['wide', 'lg', 'md', 'sm']).default('md'),
});

export const memberUpdateSchema = memberSchema.partial().extend({
  order_index: z.number().int().optional(),
});

export const eventSchema = z.object({
  club_id: z.string().uuid().nullable().default(null),
  chapter: z.string().trim().max(20).default(''),
  page: z.string().trim().max(20).default(''),
  title: z.string().trim().min(1).max(160),
  tag: z.string().trim().max(60).default(''),
  date_label: z.string().trim().max(60).default(''),
  description: z.string().trim().max(1000).default(''),
  img_url: z.string().trim().max(2000).default(''),
});

export const eventUpdateSchema = eventSchema.partial().extend({
  order_index: z.number().int().optional(),
});

export const clubSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, and hyphens only'),
  tagline: z.string().trim().max(200).default(''),
  description: z.string().trim().max(2000).default(''),
  img_url: z.string().trim().max(2000).default(''),
  accent: z.enum(['red', 'cyan', 'yellow', 'violet', 'green']).default('red'),
});

export const clubUpdateSchema = clubSchema.partial().extend({
  order_index: z.number().int().optional(),
});

export const badgeItemSchema = z.object({
  icon: z.string().trim().min(1).max(8),
  label: z.string().trim().min(1).max(80),
  rarity: z.enum(['legendary', 'rare', 'common']),
});

const buttonSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(2000),
  style: z.enum(['primary', 'accent']).optional(),
});

export const customConfigSchema = z.object({
  variant: z.enum(['panel', 'hero', 'cta', 'about']).default('panel'),
  eyebrow: z.string().trim().max(120).optional(),
  heading: z.string().trim().max(200).default(''),
  body: z.string().trim().max(2000).default(''),
  imageUrl: z.string().trim().max(2000).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['image-left', 'image-right', 'image-full', 'text-only']).default('text-only'),
  buttons: z.array(buttonSchema).max(4).default([]),
  badge: z.string().trim().max(40).optional(),
});

export const statsConfigSchema = z.object({
  stats: z.array(statItemSchema).max(20).default([]),
  badges: z.array(badgeItemSchema).max(20).default([]),
});

export const membersConfigSchema = z.object({}).catchall(z.never()).default({});
export const eventsConfigSchema = z.object({}).catchall(z.never()).default({});
export const clubsConfigSchema = z.object({}).catchall(z.never()).default({});

export const accentSchema = z.enum(['red', 'cyan', 'yellow', 'violet', 'green']);

export const sectionBaseSchema = z.object({
  title: z.string().trim().max(160).default(''),
  subtitle: z.string().trim().max(300).default(''),
  visible: z.boolean().default(true),
  accent: accentSchema.default('red'),
});

export const sectionCreateSchema = z.discriminatedUnion('type', [
  sectionBaseSchema.extend({ type: z.literal('members'), config: membersConfigSchema }),
  sectionBaseSchema.extend({ type: z.literal('events'), config: eventsConfigSchema }),
  sectionBaseSchema.extend({ type: z.literal('stats'), config: statsConfigSchema }),
  sectionBaseSchema.extend({ type: z.literal('custom'), config: customConfigSchema }),
  sectionBaseSchema.extend({ type: z.literal('clubs'), config: clubsConfigSchema }),
]);

// Updates may omit `config`/`type` entirely (e.g. a pure reorder/visibility toggle),
// so this stays a plain partial rather than the discriminated union above.
export const sectionUpdateSchema = z.object({
  type: z.enum(['members', 'events', 'stats', 'custom', 'clubs']).optional(),
  title: z.string().trim().max(160).optional(),
  subtitle: z.string().trim().max(300).optional(),
  visible: z.boolean().optional(),
  accent: accentSchema.optional(),
  order_index: z.number().int().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const reorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
});

export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(['admin', 'editor']),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  password: z.string().min(8).max(200).optional(),
});

export const mediaMetaSchema = z.object({
  alt_text: z.string().trim().max(300).default(''),
});
