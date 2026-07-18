import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

export interface PageNavLink {
  to: string;
  label: string;
}

export const Nav: React.FC<{ links: PageNavLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close the overlay on route change and lock body scroll while it's open
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="bar">
        <Link className="bar-logo" to="/">
          <span className="bar-mark">TC</span>
          <span className="bar-word">Technical<br />Committee</span>
        </Link>
        <nav className="bar-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} className={({ isActive }) => `bar-link${isActive ? ' active' : ''}`} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <a className="bar-cta" href={EPHEMERAL_URL}>Enter Ephemeral</a>
        <button
          type="button"
          className="bar-burger"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </header>

      {open && (
        <div id="site-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu-overlay-top">
            <span className="menu-overlay-word">Technical Committee</span>
            <button type="button" className="menu-close" onClick={() => setOpen(false)}>Close</button>
          </div>
          <Link className="menu-link" to="/">Home</Link>
          {links.map((l) => (
            <NavLink key={l.to} className={({ isActive }) => `menu-link${isActive ? ' active' : ''}`} to={l.to}>
              {l.label}
            </NavLink>
          ))}
          <a className="menu-link menu-link--cta" href={EPHEMERAL_URL}>Enter Ephemeral →</a>
        </div>
      )}
    </>
  );
};
