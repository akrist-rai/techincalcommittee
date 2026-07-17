import React from 'react';
import { Link } from 'react-router-dom';
import type {
  ClubsSection, CustomSection, EventsSection, MembersSection, Section, StatsSection,
} from '../lib/types';

const GaugeDial: React.FC<{ value: number }> = ({ value }) => <span className="gauge-dial">{value}</span>;

function ButtonRow({ buttons, className = 'cover-cta' }: { buttons: CustomSection['config']['buttons']; className?: string }) {
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

const HeroPanel: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  return (
    <section className="cover" data-accent={section.accent}>
      {config.imageUrl && (
        <div className="cover-bg"><img src={config.imageUrl} alt={config.imageAlt ?? ''} /></div>
      )}
      <div className="cover-frame">
        {config.eyebrow && (
          <div className="mg-caption vol-tag"><span className="mg-dot" /> {config.eyebrow}</div>
        )}
        <h1 className="cover-title mg-sfx">{config.heading}</h1>
        {config.body && <p className="cover-sub">{config.body}</p>}
        <ButtonRow buttons={config.buttons} />
      </div>
    </section>
  );
};

const CtaPanel: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  return (
    <section className="join" data-accent={section.accent}>
      {config.imageUrl && (
        <div className="join-bg"><img src={config.imageUrl} alt={config.imageAlt ?? ''} /></div>
      )}
      <div className="join-inner">
        {config.eyebrow && <div className="stamp">{config.eyebrow}</div>}
        <h2 className="mg-sfx join-title">{config.heading}</h2>
        {config.body && <p className="join-sub">{config.body}</p>}
        <ButtonRow buttons={config.buttons} className="join-links" />
      </div>
    </section>
  );
};

const PanelBlock: React.FC<{ section: CustomSection }> = ({ section }) => {
  const { config } = section;
  const layout = config.layout ?? 'text-only';
  return (
    <section className={`panel-block panel-block--${layout}`} data-accent={section.accent}>
      {config.badge && <div className="panel-block-badge">{config.badge}</div>}
      {layout !== 'text-only' && config.imageUrl && (
        <div className="panel-block-img">
          <img src={config.imageUrl} alt={config.imageAlt ?? ''} />
        </div>
      )}
      <div className="panel-block-body">
        {config.eyebrow && <div className="mg-caption"><span className="mg-dot" /> {config.eyebrow}</div>}
        {config.heading && <h2 className="mg-sfx panel-block-heading">{config.heading}</h2>}
        {config.body && <p className="panel-block-text">{config.body}</p>}
        <ButtonRow buttons={config.buttons} />
      </div>
    </section>
  );
};

const MembersSectionView: React.FC<{ section: MembersSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  return (
    <section data-accent={section.accent}>
      <div className="sect-hdr">
        <div className="sect-ttl">{section.title || 'THE CLUB'}</div>
        <div className="sect-meta">
          <div className="sect-id">FILE // {String(fileNo).padStart(3, '0')}</div>
          <div className="sect-count">{String(items.length).padStart(2, '0')} PROFILES</div>
        </div>
      </div>
      {section.subtitle && <p className="sect-sub">{section.subtitle}</p>}

      <div className="collage">
        {items.map((m) => (
          <div key={m.id} className={`cast-panel mg-panel cast-panel--${m.size}`}>
            <div className="cast-img-wrap">
              <span className="cast-role-tag">{m.role}</span>
              {m.img_url && <img src={m.img_url} alt={m.name} />}
            </div>
            <div className="cast-body">
              <div className="cast-name mg-sfx">{m.name}</div>
              {m.quote && <p className="cast-quote">{m.quote}</p>}
              {m.stats.length > 0 && (
                <div className="cast-gauges">
                  {m.stats.map((s, j) => (
                    <span className="gauge" key={j}>
                      <GaugeDial value={s.value} />
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const EventsSectionView: React.FC<{ section: EventsSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  return (
    <section data-accent={section.accent}>
      <div className="sect-hdr">
        <div className="sect-ttl">{section.title || 'ROADMAP'}</div>
        <div className="sect-meta">
          <div className="sect-id">FILE // {String(fileNo).padStart(3, '0')}</div>
          <div className="sect-count">{items.length} STOPS</div>
        </div>
      </div>
      {section.subtitle && <p className="sect-sub">{section.subtitle}</p>}

      <div className="roadmap">
        {items.map((t) => (
          <div className="roadmap-item" key={t.id}>
            <div className="roadmap-dot" />
            <div className="roadmap-card mg-panel">
              <div className="roadmap-card-hdr">
                <span className="roadmap-chapter">#{t.chapter}</span>
                <span className="roadmap-tag">{t.tag}</span>
                <span className="roadmap-date">{t.date_label}</span>
              </div>
              <h3 className="roadmap-title mg-sfx">{t.title}</h3>
              <p className="roadmap-desc">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ClubsSectionView: React.FC<{ section: ClubsSection; fileNo: number }> = ({ section, fileNo }) => {
  const items = section.items ?? [];
  return (
    <section data-accent={section.accent}>
      <div className="sect-hdr">
        <div className="sect-ttl">{section.title || 'CLUBS'}</div>
        <div className="sect-meta">
          <div className="sect-id">FILE // {String(fileNo).padStart(3, '0')}</div>
          <div className="sect-count">{items.length} CLUBS</div>
        </div>
      </div>
      {section.subtitle && <p className="sect-sub">{section.subtitle}</p>}

      <div className="teaser-grid">
        {items.map((c) => (
          <Link
            key={c.id}
            to={`/club/${c.slug}`}
            className={`teaser-card${c.img_url ? ' teaser-card--img' : ''}`}
            style={{ '--card-accent': `var(--${c.accent})` } as React.CSSProperties}
          >
            {c.img_url && (
              <div className="teaser-card-img"><img src={c.img_url} alt="" /></div>
            )}
            <span className="teaser-eyebrow">{(c.members?.length ?? 0)} MEMBER{(c.members?.length ?? 0) === 1 ? '' : 'S'}</span>
            <div className="teaser-title mg-sfx">{c.name}</div>
            {c.tagline && <p className="teaser-sub">{c.tagline}</p>}
            <span className="teaser-go">SEE THE CLUB →</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

const StatsSectionView: React.FC<{ section: StatsSection; fileNo: number }> = ({ section, fileNo }) => {
  const { stats, badges } = section.config;
  return (
    <section data-accent={section.accent}>
      <div className="sect-hdr">
        <div className="sect-ttl">{section.title || 'STATS'}</div>
        <div className="sect-meta">
          <div className="sect-id">FILE // {String(fileNo).padStart(3, '0')}</div>
          <div className="sect-count">GUILD STATS</div>
        </div>
      </div>
      {section.subtitle && <p className="sect-sub">{section.subtitle}</p>}

      <div className="status-window">
        <div className="status-col">
          <div className="status-heading mg-sfx">STATS</div>
          {stats.map((s, i) => (
            <div className="status-row" key={i}>
              <span className="status-num">{s.value}</span>
              <span className="status-lbl">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="status-divider" />
        <div className="status-col">
          <div className="status-heading mg-sfx">ACHIEVEMENTS</div>
          <div className="badges">
            {badges.map((b, i) => (
              <div className={`badge badge--${b.rarity}`} key={i}>
                <div className="badge-icon">{b.icon}</div>
                <span className="badge-rarity">{b.rarity}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const SectionRenderer: React.FC<{ section: Section; fileNo: number }> = ({ section, fileNo }) => {
  switch (section.type) {
    case 'members':
      return <MembersSectionView section={section} fileNo={fileNo} />;
    case 'events':
      return <EventsSectionView section={section} fileNo={fileNo} />;
    case 'clubs':
      return <ClubsSectionView section={section} fileNo={fileNo} />;
    case 'stats':
      return <StatsSectionView section={section} fileNo={fileNo} />;
    case 'custom':
      if (section.config.variant === 'hero') return <HeroPanel section={section} />;
      if (section.config.variant === 'cta') return <CtaPanel section={section} />;
      return <PanelBlock section={section} />;
    default:
      return null;
  }
};
