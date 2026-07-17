import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';
import { SectionRenderer } from '../components/SectionRenderer';

export const HomePage: React.FC = () => {
  const { sections, anchors } = useSiteData();
  if (!sections) return null;

  const hero = sections.find((s) => s.type === 'custom' && s.config.variant === 'hero');

  const cards = sections
    .map((s, i) => ({ section: s, anchor: anchors[i] }))
    .filter(({ section }) => !(section.type === 'custom' && section.config.variant === 'hero'));

  return (
    <>
      {hero && <SectionRenderer section={hero} fileNo={0} />}

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
