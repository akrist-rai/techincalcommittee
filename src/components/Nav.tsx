import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

export interface PageNavLink {
  to: string;
  label: string;
}

export const Nav: React.FC<{ links: PageNavLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // close the overlay on route change and lock body scroll while it's open
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`bar${scrolled ? ' bar--scrolled' : ''}`}>
        <Link className="bar-logo" to="/">
          <span className="bar-mark glitch" data-text="TC">TC</span>
          <span className="bar-word">Technical<br />Committee</span>
        </Link>
        <nav className="bar-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} className={({ isActive }) => `bar-link${isActive ? ' active' : ''}`} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <a className="bar-cta" href={EPHEMERAL_URL}>
          <span>Enter Ephemeral</span>
          <span className="bar-cta-arrow" aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          className={`bar-burger${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <span className="bar-burger-lines" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>
      </header>

      {open && (
        <div id="site-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu-overlay-top">
            <span className="menu-overlay-word">Technical Committee</span>
            <button type="button" className="menu-close" onClick={() => setOpen(false)}>
              <span className="menu-close-lines" aria-hidden="true"><span /><span /></span>
              Close
            </button>
          </div>
          <div className="menu-links">
            <Link className="menu-link" to="/" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="menu-link-index">00</span>Home
            </Link>
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                className={({ isActive }) => `menu-link${isActive ? ' active' : ''}`}
                style={{ '--i': i + 1 } as React.CSSProperties}
                to={l.to}
              >
                <span className="menu-link-index">{String(i + 1).padStart(2, '0')}</span>{l.label}
              </NavLink>
            ))}
            <a
              className="menu-link menu-link--cta"
              href={EPHEMERAL_URL}
              style={{ '--i': links.length + 1 } as React.CSSProperties}
            >
              <span className="menu-link-index">→</span>Enter Ephemeral
            </a>
          </div>
        </div>
      )}
    </>
  );
};
