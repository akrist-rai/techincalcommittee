import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from '../lib/site-data-context';
import { Nav, type PageNavLink } from '../components/Nav';

const NAV_EXCLUDED_VARIANTS = new Set(['hero', 'about']);

const MARQUEE_TEXT = 'Technical Committee ✦ Build · Break · Rebuild ✦ ';

const Marquee: React.FC = () => {
  // two copies of the same run so the -50% keyframe loops seamlessly
  const run = Array.from({ length: 6 }, (_, i) => <span key={i}>{MARQUEE_TEXT}</span>);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">{run}{run.map((s, i) => <span key={`b${i}`}>{MARQUEE_TEXT}</span>)}</div>
    </div>
  );
};

const PublicLayoutInner: React.FC = () => {
  const { sections, anchors, error } = useSiteData();

  if (error) {
    return <div className="site-status"><p>{error}</p></div>;
  }
  if (!sections) {
    return <div className="site-status">Loading…</div>;
  }

  const navLinks: PageNavLink[] = sections
    .map((s, i) => ({ section: s, anchor: anchors[i] }))
    .filter(({ section }) => section.type !== 'custom' || !NAV_EXCLUDED_VARIANTS.has(section.config.variant))
    .map(({ section, anchor }) => ({ to: `/${anchor}`, label: section.title || section.type }));

  return (
    <>
      <Nav links={navLinks} />
      <Marquee />
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="shell">
          <div className="footer-word">Technical Committee</div>
          <div className="footer-row">
            <Link to="/admin/login">Committee login</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export const PublicLayout: React.FC = () => (
  <SiteDataProvider>
    <PublicLayoutInner />
  </SiteDataProvider>
);
