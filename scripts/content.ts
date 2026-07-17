// Single source of truth for starter/default site content. Used by both
// seed.ts (idempotent — only inserts into empty tables, for fresh installs)
// and reset-content.ts (destructive — replaces members/events/sections
// wholesale, for pushing a content refresh to an already-seeded DB).

export type StatItem = { label: string; value: number };
export type BadgeItem = { icon: string; label: string; rarity: 'legendary' | 'rare' | 'common' };
export type Accent = 'red' | 'cyan' | 'yellow' | 'violet' | 'green';

export const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

export const MEDIA_BUILTINS: { url: string; alt_text: string }[] = [
  { url: '/images/hero-bg.jpeg', alt_text: 'Cover background' },
  { url: '/images/finale-bg.jpeg', alt_text: 'Finale background' },
  { url: '/images/luffy.jpeg', alt_text: 'Member portrait' },
  { url: '/images/zoro.jpeg', alt_text: 'Member portrait' },
  { url: '/images/franky.jpeg', alt_text: 'Member portrait' },
  { url: '/images/sanji.jpeg', alt_text: 'Member portrait' },
  { url: '/images/itachi.jpeg', alt_text: 'Member portrait' },
  { url: '/images/nami.jpeg', alt_text: 'Member portrait' },
  { url: '/images/usopp.jpeg', alt_text: 'Member portrait' },
  { url: '/images/brook.jpeg', alt_text: 'Member portrait' },
];

export const MEMBERS: {
  name: string;
  role: string;
  img_url: string;
  quote: string | null;
  stats: StatItem[];
  size: 'wide' | 'lg' | 'md' | 'sm';
}[] = [
  {
    name: 'A. Rai', role: 'Chairperson', img_url: '/images/luffy.jpeg',
    quote: 'ship it, then fix it. that’s the whole strategy.',
    stats: [{ label: 'Lead', value: 9 }, { label: 'Vision', value: 8 }], size: 'lg',
  },
  {
    name: 'K. Verma', role: 'Vice Chair', img_url: '/images/zoro.jpeg',
    quote: 'nothing happened. i got lost on the way here.',
    stats: [{ label: 'Ops', value: 9 }], size: 'md',
  },
  {
    name: 'S. Iyer', role: 'Backend Lead', img_url: '/images/franky.jpeg',
    quote: 'the architecture is SUUUUPER. do not ask about the migrations.',
    stats: [{ label: 'Code', value: 10 }], size: 'md',
  },
  {
    name: 'P. Nair', role: 'Frontend Lead', img_url: '/images/sanji.jpeg',
    quote: 'i only serve the finest pixels.',
    stats: [], size: 'wide',
  },
  {
    name: 'R. Kulkarni', role: 'ML Lead', img_url: '/images/itachi.jpeg',
    quote: 'it works on my GPU.', stats: [], size: 'sm',
  },
  {
    name: 'D. Sharma', role: 'Design Head', img_url: '/images/nami.jpeg',
    quote: 'that font is not on brand and you know it.', stats: [], size: 'sm',
  },
  {
    name: 'T. Khan', role: 'Events Lead', img_url: '/images/usopp.jpeg',
    quote: 'the room is booked. i think. i emailed someone.', stats: [], size: 'sm',
  },
  {
    name: 'V. Joshi', role: 'Sponsorship Lead', img_url: '/images/brook.jpeg',
    quote: 'yohohoh— i mean. yes, we accept pizza as sponsorship.', stats: [], size: 'sm',
  },
];

export const EVENTS: {
  chapter: string; page: string; title: string; tag: string; date_label: string; description: string;
}[] = [
  {
    chapter: '01', page: '004', title: 'Recruitment', tag: 'Onboarding', date_label: 'Aug 2026',
    description: 'open applications, some orientation slides nobody read, and the annual "why is git confusing" workshop.',
  },
  {
    chapter: '02', page: '018', title: 'Hack Night: Origins', tag: 'Hackathon', date_label: 'Sep 2026',
    description: '24 hours, three teams, one demo that technically worked. we’re counting it.',
  },
  {
    chapter: '03', page: '033', title: 'Systems Design Dojo', tag: 'Workshop', date_label: 'Oct 2026',
    description: 'whiteboards, load balancers, and an alarming number of anime references per slide.',
  },
  {
    chapter: '04', page: '051', title: 'Inter-College Clash', tag: 'Competition', date_label: 'Nov 2026',
    description: 'we traveled, we competed, we came back with a trophy and a collective sleep debt.',
  },
  {
    chapter: '05', page: '069', title: 'Merch Drop: Vol. 01', tag: 'Release', date_label: 'Jan 2027',
    description: 'the merch you keep hearing about. see the Merch page. it is, in fact, not out yet.',
  },
  {
    chapter: '06', page: '084', title: 'Finale: DemoCon', tag: 'Showcase', date_label: 'Mar 2027',
    description: 'every project from the year, one evening, way too many extension cords.',
  },
];

export interface SectionSeed {
  type: 'members' | 'events' | 'stats' | 'custom';
  title: string;
  subtitle: string;
  accent: Accent;
  config: unknown;
}

export const SECTIONS: SectionSeed[] = [
  {
    type: 'custom', title: 'Cover', subtitle: '', accent: 'red',
    config: {
      variant: 'hero',
      eyebrow: 'EST. WHENEVER — STILL RUNNING',
      heading: 'TECHNICAL COMMITTEE',
      body: 'we’re the club that turns "wait, can we even build that?" into a group chat, then a repo, then eventually something people can click on. no dress code, minimal deadlines, moderate chaos.',
      imageUrl: '/library/0xbg003w.jpeg',
      imageAlt: 'Cover art',
      buttons: [
        { label: 'MEET THE CLUB', href: '/club', style: 'primary' },
        { label: 'ENTER EPHEMERAL', href: EPHEMERAL_URL, style: 'accent' },
      ],
    },
  },
  {
    type: 'custom', title: 'About', subtitle: 'who we are, roughly.', accent: 'cyan',
    config: {
      variant: 'panel',
      eyebrow: 'THE PITCH',
      heading: 'WHAT WE ACTUALLY DO',
      body: 'short version: we build things, break them in new and exciting ways, then build them again slightly better. workshops when someone volunteers to run one, hackathons when someone’s brave enough to organize one, and a lot of debugging over shared screens at hours we don’t mention to our parents. no prior experience required — just google the error message before you ask the group chat.',
      imageUrl: '/library/22e445ac.jpeg',
      imageAlt: 'Two members, allegedly working',
      layout: 'image-right',
    },
  },
  {
    type: 'members', title: 'Club', subtitle: 'everyone who shows up and pretends to know what they’re doing.', accent: 'violet',
    config: {},
  },
  {
    type: 'events', title: 'Roadmap', subtitle: 'here’s roughly what’s happening and roughly when. dates are optimistic.', accent: 'yellow',
    config: {},
  },
  {
    type: 'custom', title: 'Merch', subtitle: 'not out yet. we know. we know.', accent: 'green',
    config: {
      variant: 'panel',
      eyebrow: 'DROP ZERO',
      heading: 'MERCH',
      badge: 'COMING SOON',
      body: 'we designed a hoodie. then we redesigned it four times. then someone suggested stickers instead. currently in a stalemate. check back whenever it resolves — we’ll probably forget to announce it, so honestly just check back.',
      layout: 'text-only',
      buttons: [{ label: 'BUG US ABOUT IT', href: '/join', style: 'primary' }],
    },
  },
  {
    type: 'custom', title: 'Join', subtitle: '', accent: 'red',
    config: {
      variant: 'cta',
      eyebrow: 'TO BE CONTINUED…',
      heading: 'NEXT CHAPTER: YOU?',
      body: 'this page is the front door. the actual stuff — challenges, leaderboard, the arena — lives on ephemeral. click through, make an account, see what happens.',
      imageUrl: '/library/0xbg001w.jpeg',
      imageAlt: 'Finale art',
      buttons: [
        { label: 'ENTER EPHEMERAL!', href: EPHEMERAL_URL, style: 'accent' },
        { label: 'APPLY TO JOIN', href: `${EPHEMERAL_URL}/members`, style: 'primary' },
      ],
    },
  },
];
