import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

export interface PageNavLink {
  to: string;
  label: string;
}

// Fight Club's own nav is a fixed side index + a purely-atmospheric corner
// HUD — no top bar, no logo lockup. This mirrors that: a vertical numbered
// index on desktop, a HUD frame for identity/wayfinding, and — since this
// is a real multi-page site and not a one-scroll tribute page — a small
// burger that opens the full-screen menu on narrow screens where the side
// index hides.
export const Nav: React.FC<{ links: PageNavLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className="hud" aria-hidden="true">
        <div className="br-corner tlc" /><div className="br-corner trc" />
        <div className="br-corner blc" /><div className="br-corner brc" />
      </div>
      <Link className="hud-home" to="/">TECHNICAL COMMITTEE</Link>

      <nav className="idx" aria-label="Primary">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'on' : undefined)}>
              <span>00</span> Home
            </NavLink>
          </li>
          {links.map((l, i) => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => (isActive ? 'on' : undefined)}>
                <span>{String(i + 1).padStart(2, '0')}</span> {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a className="idx-cta" href={EPHEMERAL_URL}>
              <span>→</span> Enter Ephemeral
            </a>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span className="burger-lines" aria-hidden="true">
          <span /><span /><span />
        </span>
      </button>

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
