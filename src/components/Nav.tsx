import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

export interface PageNavLink {
  to: string;
  label: string;
}

export const Nav: React.FC<{ links: PageNavLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        <Link className="tb-logo" to="/">TECHNICAL<em>COMMITTEE</em></Link>
        <nav className="tb-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} className={({ isActive }) => `tb-link${isActive ? ' active' : ''}`} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <a className="tb-enter" href={EPHEMERAL_URL}>ENTER EPHEMERAL</a>
        <button
          type="button"
          className="tb-burger"
          aria-expanded={open}
          aria-controls="tb-mobile-panel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'X' : 'MENU'}
        </button>
      </div>

      <nav id="tb-mobile-panel" className={`tb-mobile-panel${open ? ' open' : ''}`} aria-label="Primary mobile">
        {links.map((l) => (
          <NavLink key={l.to} className="tb-link" to={l.to} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <a className="tb-link" href={EPHEMERAL_URL}>ENTER EPHEMERAL</a>
      </nav>
    </>
  );
};
