export type Role = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at?: string;
  last_login_at?: string | null;
}

export interface StatItem {
  label: string;
  value: number;
}

export interface Member {
  id: string;
  club_id: string | null;
  name: string;
  role: string;
  img_url: string;
  quote: string | null;
  stats: StatItem[];
  size: 'wide' | 'lg' | 'md' | 'sm';
  order_index: number;
}

export interface EventItem {
  id: string;
  club_id: string | null;
  chapter: string;
  page: string;
  title: string;
  tag: string;
  date_label: string;
  description: string;
  order_index: number;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  img_url: string;
  accent: Accent;
  order_index: number;
  members?: Member[];
  events?: EventItem[];
}

export interface BadgeItem {
  icon: string;
  label: string;
  rarity: 'legendary' | 'rare' | 'common';
}

export interface SectionButton {
  label: string;
  href: string;
  style?: 'primary' | 'accent';
}

export interface CustomConfig {
  variant: 'panel' | 'hero' | 'cta' | 'about';
  eyebrow?: string;
  heading: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  layout: 'image-left' | 'image-right' | 'image-full' | 'text-only';
  buttons: SectionButton[];
  badge?: string;
}

export interface StatsConfig {
  stats: StatItem[];
  badges: BadgeItem[];
}

export type SectionType = 'members' | 'events' | 'stats' | 'custom' | 'clubs';
export type Accent = 'red' | 'cyan' | 'yellow' | 'violet' | 'green';

export interface SectionBase {
  id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  visible: boolean;
  accent: Accent;
  order_index: number;
}

export interface MembersSection extends SectionBase {
  type: 'members';
  config: Record<string, never>;
  items?: Member[];
}

export interface EventsSection extends SectionBase {
  type: 'events';
  config: Record<string, never>;
  items?: EventItem[];
}

export interface ClubsSection extends SectionBase {
  type: 'clubs';
  config: Record<string, never>;
  items?: Club[];
}

export interface StatsSection extends SectionBase {
  type: 'stats';
  config: StatsConfig;
}

export interface CustomSection extends SectionBase {
  type: 'custom';
  config: CustomConfig;
}

export type Section = MembersSection | EventsSection | ClubsSection | StatsSection | CustomSection;

export interface MediaItem {
  id: string;
  url: string;
  alt_text: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface SiteData {
  sections: Section[];
}
