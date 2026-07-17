import React, { useState } from 'react';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

interface CastMember {
  name: string;
  role: string;
  img: string;
  quote?: string;
  stats: { label: string; value: number }[];
  size: 'wide' | 'lg' | 'md' | 'sm';
}

const CAST: CastMember[] = [
  {
    name: 'A. Rai', role: 'guild master', img: '/images/luffy.jpeg', quote: 'just deploy it and go to sleep.',
    stats: [{ label: 'vibes', value: 9 }, { label: 'vision', value: 8 }], size: 'lg'
  },
  {
    name: 'K. Verma', role: 'second in command', img: '/images/zoro.jpeg', quote: 'im not lost, the prod server is.',
    stats: [{ label: 'ops', value: 9 }], size: 'md'
  },
  {
    name: 'S. Iyer', role: 'backend demon', img: '/images/franky.jpeg', quote: 'if it works, don\'t touch it.',
    stats: [{ label: 'code', value: 10 }], size: 'md'
  },
  { name: 'P. Nair', role: 'pixel pusher', img: '/images/sanji.jpeg', quote: 'make it pop, they said. whatever.', stats: [], size: 'wide' },
  { name: 'R. Kulkarni', role: 'ml wizard', img: '/images/itachi.jpeg', stats: [], size: 'sm' },
  { name: 'D. Sharma', role: 'figma lord', img: '/images/nami.jpeg', stats: [], size: 'sm' },
  { name: 'T. Khan', role: 'hype man', img: '/images/usopp.jpeg', stats: [], size: 'sm' },
  { name: 'V. Joshi', role: 'money bags', img: '/images/brook.jpeg', stats: [], size: 'sm' },
];

interface TocEntry {
  ch: string;
  page: string;
  title: string;
  tag: string;
  date: string;
  desc: string;
}

const TOC: TocEntry[] = [
  {
    ch: '01', page: '004', title: 'welcome to the circus', tag: 'init', date: 'aug 2026',
    desc: 'explaining what git is for the 100th time.'
  },
  {
    ch: '02', page: '018', title: 'nobody slept', tag: 'hack', date: 'sep 2026',
    desc: 'we built some stuff. half of it works. good enough.'
  },
  {
    ch: '03', page: '033', title: 'system design but make it anime', tag: 'yappin', date: 'oct 2026',
    desc: 'drawing boxes on a whiteboard and calling it architecture.'
  },
  {
    ch: '04', page: '051', title: 'away game', tag: 'clash', date: 'nov 2026',
    desc: 'we pulled up, got a trophy, went home to sleep.'
  },
  {
    ch: '05', page: '069', title: 'drip check', tag: 'merch', date: 'jan 2027',
    desc: 'finally got the hoodies. they go hard.'
  },
  {
    ch: '06', page: '084', title: 'the season finale', tag: 'demo', date: 'mar 2027',
    desc: 'showing off everything before we disappear for a month.'
  },
];

const STATS = [
  { label: 'people who actually show up', value: 42 },
  { label: 'things we organized', value: 18 },
  { label: 'bugs shipped to prod', value: 9001 },
  { label: 'trophies', value: 7 },
  { label: 'coffees consumed', value: 999 },
];

const BADGES: { icon: string; label: string; rarity: 'legendary' | 'rare' | 'common' }[] = [
  { icon: '🏆', label: 'carried the team', rarity: 'legendary' },
  { icon: '💀', label: 'broke prod on friday', rarity: 'rare' },
  { icon: '🛠️', label: 'actually shipped', rarity: 'common' },
  { icon: '🐉', label: 'deleted the db', rarity: 'rare' },
  { icon: '🗣️', label: 'yapped too much', rarity: 'common' },
  { icon: '⚡', label: 'fueled by monster', rarity: 'legendary' },
];

const GaugeDial: React.FC<{ value: number; max?: number }> = ({ value, max = 10 }) => {
  return (
    <span className="gauge-dial">
      {value}
    </span>
  );
};

export const App: React.FC = () => {
  const [tocOpen, setTocOpen] = useState<string | null>(TOC[0].ch);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('home');

  const navigate = (page: string) => {
    setCurrentPage(page);
    setMobileNavOpen(false);
    window.scrollTo(0, 0);
  };

  const navLinks = [
    { id: 'home', label: 'cover' },
    { id: 'cast', label: 'the gang' },
    { id: 'chapters', label: 'arcs' },
    { id: 'stats', label: 'power scaling' },
  ];

  return (
    <>
      <div className="scan" />
      <div className="dith" />
      <div className="halftone-cyan" />

      <div className="topbar">
        <span className="tb-logo" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>THE<em>CREW</em></span>
        <nav className="tb-nav" aria-label="Primary">
          {navLinks.map((l) => (
            <button key={l.id} className={`tb-link ${currentPage === l.id ? 'active' : ''}`} onClick={() => navigate(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {l.label}
            </button>
          ))}
        </nav>
        <a className="tb-enter" href={EPHEMERAL_URL}>jump in</a>
        <button
          type="button"
          className="tb-burger"
          aria-expanded={mobileNavOpen}
          aria-controls="tb-mobile-panel"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {mobileNavOpen ? 'nah' : 'menu'}
        </button>
      </div>
      
      <nav
        id="tb-mobile-panel"
        className={`tb-mobile-panel${mobileNavOpen ? ' open' : ''}`}
        aria-label="Primary mobile"
      >
        {navLinks.map((l) => (
          <button
            key={l.id}
            className="tb-link"
            onClick={() => navigate(l.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="wrap">

        {currentPage === 'home' && (
          <>
            <section className="cover">
              <div className="cover-bg"><img src="/images/hero-bg.jpeg" alt="vibe check" /></div>
              <div className="cover-frame">
                <div className="mg-caption vol-tag"><span className="mg-dot" /> vol. 01 — idk — 2026</div>
                <h1 className="cover-title mg-sfx">
                  <span className="hl">THE</span><br />CREW
                </h1>
                <p className="cover-sub">
                  we write code, break things, and pretend we know what we're doing. here's who we are and what we did.
                </p>
                <div className="cover-cta">
                  <button className="btn" onClick={() => navigate('cast')}>who are these guys</button>
                  <a className="btn btn-acc" href={EPHEMERAL_URL}>just let me in</a>
                </div>
              </div>
            </section>
            
            <section id="join" className="join" style={{ marginTop: '4rem' }}>
              <div className="join-bg"><img src="/images/finale-bg.jpeg" alt="boom" /></div>
              <div className="join-inner">
                <div className="stamp">cliffhanger...</div>
                <h2 className="mg-sfx join-title">NEXT UP:<br />YOU, I GUESS?</h2>
                <p className="join-sub">
                  this page is just the lobby. the real chaos happens on the main app.
                </p>
                <div className="join-links">
                  <a className="btn btn-acc" href={EPHEMERAL_URL}>take me there</a>
                  <a className="btn btn-alt" href={`${EPHEMERAL_URL}/members`}>i want to suffer too (apply)</a>
                </div>
              </div>
            </section>
          </>
        )}

        {currentPage === 'cast' && (
          <section id="cast" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">THE GANG</div>
              <div className="sect-meta">
                <div className="sect-id">intel // 001</div>
                <div className="sect-count">{String(CAST.length).padStart(2, '0')} nerds</div>
              </div>
            </div>

            <div className="collage">
              {CAST.map((m, i) => (
                <div key={i} className={`cast-panel mg-panel cast-panel--${m.size}`}>
                  <div className="cast-img-wrap">
                    <span className="cast-role-tag">{m.role}</span>
                    <img src={m.img} alt={m.name} />
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
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="btn" onClick={() => navigate('chapters')}>alright, what's next</button>
            </div>
          </section>
        )}

        {currentPage === 'chapters' && (
          <section id="chapters" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">STORY ARCS</div>
              <div className="sect-meta">
                <div className="sect-id">log // 002</div>
                <div className="sect-count">{TOC.length} events</div>
              </div>
            </div>

            <div className="toc">
              {TOC.map((t) => (
                <details
                  key={t.ch}
                  className="toc-row"
                  open={tocOpen === t.ch}
                  onToggle={(e) => {
                    const isOpen = (e.target as HTMLDetailsElement).open;
                    setTocOpen((prev) => {
                      if (isOpen) return t.ch;
                      return prev === t.ch ? null : prev;
                    });
                  }}
                >
                  <summary>
                    <span className="toc-ch">#{t.ch}</span>
                    <span className="toc-title">{t.title}</span>
                    <span className="toc-leader" />
                    <span className="toc-page">P.{t.page}</span>
                  </summary>
                  <div className="toc-body">
                    <span className="toc-tag">{t.tag}</span>
                    <p className="toc-desc">{t.desc}</p>
                    <span className="toc-date">{t.date}</span>
                  </div>
                </details>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="btn btn-alt" onClick={() => navigate('stats')}>show me the stats</button>
            </div>
          </section>
        )}

        {currentPage === 'stats' && (
          <section id="stats" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">POWER SCALING</div>
              <div className="sect-meta">
                <div className="sect-id">data // 003</div>
                <div className="sect-count">useless metrics</div>
              </div>
            </div>

            <div className="status-window">
              <div className="status-col">
                <div className="status-heading mg-sfx">numbers</div>
                {STATS.map((s, i) => (
                  <div className="status-row" key={i}>
                    <span className="status-num">{s.value}</span>
                    <span className="status-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="status-divider" />
              <div className="status-col">
                <div className="status-heading mg-sfx">achievements</div>
                <div className="badges">
                  {BADGES.map((b, i) => (
                    <div className={`badge badge--${b.rarity}`} key={i}>
                      <div className="badge-icon">{b.icon}</div>
                      <span className="badge-rarity">{b.rarity}</span>
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="btn" onClick={() => navigate('home')}>back to the start</button>
            </div>
          </section>
        )}

      </div>

      <div className="colophon">
        THE CREW VOL. 01 — NO RIGHTS RESERVED — WE LITERALLY JUST GOOGLED HOW TO MAKE THIS
      </div>
    </>
  );
};