import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SiteDataProvider, useSiteData } from '../lib/site-data-context';
import { Nav, type PageNavLink } from '../components/Nav';

const NAV_EXCLUDED_VARIANTS = new Set(['hero', 'about']);

const PublicLayoutInner: React.FC = () => {
  const { sections, anchors, error } = useSiteData();

  if (error) {
    return <div className="site-status"><p>{error}</p></div>;
  }
  if (!sections) {
    return <div className="site-status">LOADING…</div>;
  }

  const navLinks: PageNavLink[] = sections
    .map((s, i) => ({ section: s, anchor: anchors[i] }))
    .filter(({ section }) => section.type !== 'custom' || !NAV_EXCLUDED_VARIANTS.has(section.config.variant))
    .map(({ section, anchor }) => ({ to: `/${anchor}`, label: (section.title || section.type).toUpperCase() }));

  return (
    <>
      <div className="scan" />
      <div className="dith" />
      <Nav links={navLinks} />
      <div className="wrap" style={{ minHeight: '80vh', paddingBottom: '4rem' }}>
        <Outlet />
      </div>
      <div className="colophon">
        <Link to="/admin/login">committee login</Link>
      </div>
    </>
  );
};

export const PublicLayout: React.FC = () => (
  <SiteDataProvider>
    <PublicLayoutInner />
  </SiteDataProvider>
);
