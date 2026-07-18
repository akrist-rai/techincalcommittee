import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';
import type {
  ClubsSection, CustomSection, EventsSection, MembersSection, Section, StatsSection,
} from '../lib/types';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

function ButtonRow({ buttons, className }: { buttons: CustomSection['config']['buttons']; className: string }) {
  if (!buttons || buttons.length === 0) return null;
  return (
    <div className={className}>
      {buttons.map((b, i) => (
        <a key={i} className={`btn ${b.style === 'accent' ? 'btn-acc' : ''}`} href={b.href}>
          {b.label}
        </a>
      ))}
    </div>
  );
}

function SectionBand({ section, fileNo }: { section: Section; fileNo: number }) {
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`sec-band rev${inView ? ' in' : ''}`}>
      <div className="shell">
        <div className="sec-band-row">
          <span className="sec-index">FILE_{String(fileNo).padStart(2, '0')}</span>
          <h2 className="sec-title glitch" data-text={section.title || section.type}>{section.title || section.type}</h2>
        </div>
        {section.subtitle && <p className="sec-sub">{section.subtitle}</p>}
      </div>
    </div>
  );
}

const HeroPoster: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="hero" data-accent={section.accent}>
      {config.imageUrl && (
        <div className="hero-img"><img src={config.imageUrl} alt={config.imageAlt ?? ''} /></div>
      )}
      <div ref={ref} className={`hero-inner rev${inView ? ' in' : ''}`}>
        <div className="shell">
          {config.eyebrow && <span className="chip chip--accent">{config.eyebrow}</span>}
          <h1 className="hero-title glitch" data-text={config.heading}>{config.heading}</h1>
          {config.body && <p className="hero-body">{config.body}</p>}
          <ButtonRow buttons={config.buttons} className="hero-btns" />
        </div>
      </div>
    </section>
  );
};

const AboutPoster: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="about" data-accent={section.accent}>
      <div ref={ref} className={`shell rev${inView ? ' in' : ''}`}>
        {config.eyebrow && <p className="about-kicker">{config.eyebrow}</p>}
        <h1 className="about-title">{config.heading}</h1>
        <div className="about-grid">
          <div>
            <p className="about-text">{config.body}</p>
            <ButtonRow buttons={config.buttons} className="about-btns" />
          </div>
          {config.imageUrl && (
            <div className="about-img"><img src={config.imageUrl} alt={config.imageAlt ?? ''} /></div>
          )}
        </div>
      </div>
    </section>
  );
};

const CtaBand: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="cta" data-accent={section.accent}>
      <div ref={ref} className={`shell rev${inView ? ' in' : ''}`}>
        {config.eyebrow && <span className="chip">{config.eyebrow}</span>}
        <h2 className="cta-title glitch" data-text={config.heading}>{config.heading}</h2>
        {config.body && <p className="cta-body">{config.body}</p>}
        <ButtonRow buttons={config.buttons} className="cta-btns" />
      </div>
    </section>
  );
};

const PanelBlock: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  const layout = config.layout ?? 'text-only';
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="sec" data-accent={section.accent}>
      <div className="shell">
        <div ref={ref} className={`block block--${layout} rev${inView ? ' in' : ''}`}>
          {config.badge && <div className="block-badge">{config.badge}</div>}
          {layout !== 'text-only' && config.imageUrl && (
            <div className="block-img"><img src={config.imageUrl} alt={config.imageAlt ?? ''} /></div>
          )}
          <div className="block-body">
            {config.eyebrow && <span className="chip chip--accent">{config.eyebrow}</span>}
            {config.heading && <h2 className="block-heading">{config.heading}</h2>}
            {config.body && <p className="block-text">{config.body}</p>}
            <ButtonRow buttons={config.buttons} className="block-btns" />
          </div>
        </div>
      </div>
    </section>
  );
};

const ClubsView: React.FC<{ section: ClubsSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="sec" data-accent={section.accent}>
      <SectionBand section={section} fileNo={fileNo} />
      <div className="sec-body">
        <div className="shell">
          <div ref={ref} className={`club-grid rev${inView ? ' in' : ''}`}>
            {items.map((c) => {
              const count = c.members?.length ?? 0;
              return (
                <Link
                  key={c.id}
                  to={`/club/${c.slug}`}
                  className="club-tile"
                  data-accent={c.accent}
                >
                  {c.img_url && (
                    <div className="club-tile-img"><img src={c.img_url} alt="" /></div>
                  )}
                  <div className="club-tile-body">
                    <span className="chip chip--accent club-tile-count">{count} member{count === 1 ? '' : 's'}</span>
                    <div className="club-tile-name">{c.name}</div>
                    {c.tagline && <p className="club-tile-tag">{c.tagline}</p>}
                    <div className="club-tile-go">See the club →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

type EventEntry = NonNullable<EventsSection['items']>[number];

const TimelineItem: React.FC<{ event: EventEntry; index: number; clubName?: string; image: string }> = ({
  event, index, clubName, image,
}) => {
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`timeline-item${inView ? ' is-in' : ''}`}>
      <div className="timeline-node">{event.chapter || String(index + 1).padStart(2, '0')}</div>
      <div className="timeline-card">
        <div className="timeline-card-img">
          {image ? <img src={image} alt="" loading="lazy" /> : <div className="timeline-card-img--empty" />}
        </div>
        <div className="timeline-card-body">
          <div className="timeline-card-meta">
            {event.date_label && <span className="timeline-date">{event.date_label}</span>}
            {event.tag && <span className="chip chip--accent">{event.tag}</span>}
            {clubName && <span className="chip">{clubName}</span>}
          </div>
          <h3 className="timeline-title">{event.title}</h3>
          {event.description && <p className="timeline-desc">{event.description}</p>}
        </div>
      </div>
    </div>
  );
};

export const TimelineList: React.FC<{ items: NonNullable<EventsSection['items']> }> = ({ items }) => {
  const { clubs } = useSiteData();
  const clubById = new Map(clubs.map((c) => [c.id, c]));

  return (
    <div className="timeline">
      <div className="timeline-spine" aria-hidden="true" />
      {items.map((ev, i) => {
        const club = ev.club_id ? clubById.get(ev.club_id) : undefined;
        return (
          <TimelineItem
            key={ev.id}
            event={ev}
            index={i}
            clubName={club?.name}
            image={ev.img_url || club?.img_url || ''}
          />
        );
      })}
    </div>
  );
};

const EventsView: React.FC<{ section: EventsSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  return (
    <section className="sec" data-accent={section.accent}>
      <SectionBand section={section} fileNo={fileNo} />
      <div className="sec-body">
        <div className="shell">
          <TimelineList items={items} />
        </div>
      </div>
    </section>
  );
};

export const CrewGrid: React.FC<{ items: NonNullable<MembersSection['items']> }> = ({ items }) => (
  <div className="crew">
    {items.map((m) => (
      <div key={m.id} className={`crew-card crew-card--${m.size}`}>
        <div className="crew-img">
          <span className="crew-role">{m.role}</span>
          {m.img_url && <img src={m.img_url} alt={m.name} />}
        </div>
        <div className="crew-body">
          <div className="crew-name">{m.name}</div>
          {m.quote && <p className="crew-quote">{m.quote}</p>}
          {m.stats.length > 0 && (
            <div className="crew-stats">
              {m.stats.map((s, j) => (
                <span className="gauge" key={j}>
                  <span className="gauge-dial">{s.value}</span>
                  {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

const MembersView: React.FC<{ section: MembersSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="sec" data-accent={section.accent}>
      <SectionBand section={section} fileNo={fileNo} />
      <div className="sec-body">
        <div className="shell">
          <div ref={ref} className={`rev${inView ? ' in' : ''}`}>
            <CrewGrid items={items} />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsView: React.FC<{ section: StatsSection; fileNo: number }> = ({ section, fileNo }) => {
  const { stats, badges } = section.config;
  const [ref, inView] = useReveal<HTMLDivElement>();
  return (
    <section className="sec" data-accent={section.accent}>
      <SectionBand section={section} fileNo={fileNo} />
      <div className="sec-body">
        <div ref={ref} className={`shell rev${inView ? ' in' : ''}`}>
          <div className="stat-grid">
            {stats.map((s, i) => (
              <div className="stat-block" key={i}>
                <div className="stat-num">{s.value}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          {badges.length > 0 && (
            <div className="badge-grid">
              {badges.map((b, i) => (
                <div className={`badge-tile badge-tile--${b.rarity}`} key={i}>
                  <div className="badge-tile-icon">{b.icon}</div>
                  {b.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const SectionRenderer: React.FC<{ section: Section; fileNo: number }> = ({ section, fileNo }) => {
  switch (section.type) {
    case 'members':
      return <MembersView section={section} fileNo={fileNo} />;
    case 'events':
      return <EventsView section={section} fileNo={fileNo} />;
    case 'clubs':
      return <ClubsView section={section} fileNo={fileNo} />;
    case 'stats':
      return <StatsView section={section} fileNo={fileNo} />;
    case 'custom':
      if (section.config.variant === 'hero') return <HeroPoster section={section} />;
      if (section.config.variant === 'about') return <AboutPoster section={section} />;
      if (section.config.variant === 'cta') return <CtaBand section={section} />;
      return <PanelBlock section={section} />;
    default:
      return null;
  }
};
