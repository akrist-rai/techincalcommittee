import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';
import { SectionRenderer } from '../components/SectionRenderer';

const HOME_INLINE_VARIANTS = new Set(['hero', 'about']);

export const HomePage: React.FC = () => {
  const { sections, anchors } = useSiteData();
  if (!sections) return null;

  const isInline = (s: (typeof sections)[number]) => s.type === 'custom' && HOME_INLINE_VARIANTS.has(s.config.variant);

  const hero = sections.find((s) => s.type === 'custom' && s.config.variant === 'hero');
  const about = sections.find((s) => s.type === 'custom' && s.config.variant === 'about');

  const cards = sections
    .map((s, i) => ({ section: s, anchor: anchors[i] }))
    .filter(({ section }) => !isInline(section));

  return (
    <>
      {hero && <SectionRenderer section={hero} fileNo={0} />}
      {about && <SectionRenderer section={about} fileNo={0} />}

      <div className="teaser-grid">
        {cards.map(({ section, anchor }) => {
          const isCta = section.type === 'custom' && section.config.variant === 'cta';
          return (
            <Link
              key={section.id}
              to={`/${anchor}`}
              className="teaser-card"
              style={{ '--card-accent': `var(--${section.accent})` } as React.CSSProperties}
            >
              <span className="teaser-eyebrow">{isCta ? 'JOIN UP' : section.type.toUpperCase()}</span>
              <div className="teaser-title mg-sfx">{section.title || section.type}</div>
              {section.subtitle && <p className="teaser-sub">{section.subtitle}</p>}
              <span className="teaser-go">READ THIS ONE →</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};
