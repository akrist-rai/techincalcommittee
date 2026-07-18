import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from '../lib/site-data-context';
import { Nav, type PageNavLink } from '../components/Nav';
import { Ambient } from '../components/Ambient';

const NAV_EXCLUDED_VARIANTS = new Set(['hero', 'about']);

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
      <Ambient />
      <Nav links={navLinks} />
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="shell" />
      </footer>
    </>
  );
};

export const PublicLayout: React.FC = () => (
  <SiteDataProvider>
    <PublicLayoutInner />
  </SiteDataProvider>
);
