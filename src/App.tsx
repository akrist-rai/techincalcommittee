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
    name: 'A. Rai', role: 'Chairperson', img: '/images/luffy.jpeg', quote: 'Ship it, then fix it. That is our way.',
    stats: [{ label: 'Lead', value: 9 }, { label: 'Vision', value: 8 }], size: 'lg'
  },
  {
    name: 'K. Verma', role: 'Vice Chair', img: '/images/zoro.jpeg', quote: 'Nothing happened.',
    stats: [{ label: 'Ops', value: 9 }], size: 'md'
  },
  {
    name: 'S. Iyer', role: 'Backend Lead', img: '/images/franky.jpeg', quote: 'Super SUUUUPER architecture!',
    stats: [{ label: 'Code', value: 10 }], size: 'md'
  },
  { name: 'P. Nair', role: 'Frontend Lead', img: '/images/sanji.jpeg', quote: 'I only serve the finest UI.', stats: [], size: 'wide' },
  { name: 'R. Kulkarni', role: 'ML Lead', img: '/images/itachi.jpeg', stats: [], size: 'sm' },
  { name: 'D. Sharma', role: 'Design Head', img: '/images/nami.jpeg', stats: [], size: 'sm' },
  { name: 'T. Khan', role: 'Events Lead', img: '/images/usopp.jpeg', stats: [], size: 'sm' },
  { name: 'V. Joshi', role: 'Sponsorship Lead', img: '/images/brook.jpeg', stats: [], size: 'sm' },
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
    ch: '01', page: '004', title: 'Recruitment Arc', tag: 'Onboarding', date: 'Aug 2026',
    desc: 'Open applications, orientation, and the annual "why is git confusing" workshop.'
  },
  {
    ch: '02', page: '018', title: 'Hack Night: Origins', tag: 'Hackathon', date: 'Sep 2026',
    desc: '24-hour build sprint. Three teams. One working demo (allegedly).'
  },
  {
    ch: '03', page: '033', title: 'Systems Design Dojo', tag: 'Workshop', date: 'Oct 2026',
    desc: 'Whiteboards, load balancers, and a surprising number of anime references.'
  },
  {
    ch: '04', page: '051', title: 'Inter-College Clash', tag: 'Competition', date: 'Nov 2026',
    desc: 'We traveled, we competed, we returned with a trophy and zero sleep.'
  },
  {
    ch: '05', page: '069', title: 'Merch Drop: Vol. 01', tag: 'Release', date: 'Jan 2027',
    desc: 'First official committee merchandise line ships to members.'
  },
  {
    ch: '06', page: '084', title: 'Finale: DemoCon', tag: 'Showcase', date: 'Mar 2027',
    desc: 'Every project from the year, presented in one panel-packed evening.'
  },
];

const STATS = [
  { label: 'Active Members', value: 42 },
  { label: 'Events Hosted', value: 18 },
  { label: 'Commits Pushed', value: 9001 },
  { label: 'Hackathons Won', value: 7 },
  { label: 'All-Nighters / Month', value: 3 },
];

const BADGES: { icon: string; label: string; rarity: 'legendary' | 'rare' | 'common' }[] = [
  { icon: '🏆', label: 'Hackathon S-Rank', rarity: 'legendary' },
  { icon: '⚔️', label: '100 PRs Merged', rarity: 'rare' },
  { icon: '🛠️', label: 'Shipped v1.0', rarity: 'common' },
  { icon: '🐉', label: 'Boss Bug Slain', rarity: 'rare' },
  { icon: '📜', label: 'First Talk Given', rarity: 'common' },
  { icon: '⚡', label: '48hr No Sleep', rarity: 'legendary' },
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
    { id: 'home', label: 'HOME' },
    { id: 'cast', label: 'CAST' },
    { id: 'chapters', label: 'INDEX' },
    { id: 'stats', label: 'POWER LEVELS' },
  ];

  return (
    <>
      <div className="scan" />
      <div className="dith" />

      <div className="topbar">
        <span className="tb-logo" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>TECHNICAL<em>COMMITTEE</em></span>
        <nav className="tb-nav" aria-label="Primary">
          {navLinks.map((l) => (
            <button key={l.id} className={`tb-link ${currentPage === l.id ? 'active' : ''}`} onClick={() => navigate(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {l.label}
            </button>
          ))}
        </nav>
        <a className="tb-enter" href={EPHEMERAL_URL}>ENTER EPHEMERAL</a>
        <button
          type="button"
          className="tb-burger"
          aria-expanded={mobileNavOpen}
          aria-controls="tb-mobile-panel"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {mobileNavOpen ? 'X' : 'MENU'}
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

      <div className="wrap" style={{ minHeight: '80vh', paddingBottom: '4rem' }}>

        {currentPage === 'home' && (
          <>
            <section className="cover">
              <div className="cover-bg"><img src="/images/hero-bg.jpeg" alt="Cyberpunk City Skyline" /></div>
              <div className="cover-frame">
                <div className="mg-caption vol-tag"><span className="mg-dot" /> VOL. 01 — FIRST PRINTING — 2026</div>
                <h1 className="cover-title mg-sfx">
                  <span className="hl">TECHNICAL</span><br />COMMITTEE
                </h1>
                <p className="cover-sub">
                  BUILDERS. BREAKERS. BOSS-FIGHT DEBUGGERS. THE FULL CAST, THE CHAPTER INDEX, AND A WAY IN TO EPHEMERAL.
                </p>
                <div className="cover-cta">
                  <button className="btn" onClick={() => navigate('cast')}>MEET THE CAST</button>
                  <a className="btn btn-acc" href={EPHEMERAL_URL}>READ NOW!</a>
                </div>
              </div>
            </section>
            
            <section id="join" className="join" style={{ marginTop: '4rem' }}>
              <div className="join-bg"><img src="/images/finale-bg.jpeg" alt="Action Burst" /></div>
              <div className="join-inner">
                <div className="stamp">TO BE CONTINUED...</div>
                <h2 className="mg-sfx join-title">NEXT CHAPTER:<br />YOU?</h2>
                <p className="join-sub">
                  THIS PAGE IS THE COMMITTEE'S FRONT DOOR. EVERYTHING ELSE, THE CHALLENGES, THE LEADERBOARD, THE ARENA, LIVES ON EPHEMERAL.
                </p>
                <div className="join-links">
                  <a className="btn btn-acc" href={EPHEMERAL_URL}>ENTER EPHEMERAL!</a>
                  <a className="btn" href={`${EPHEMERAL_URL}/members`}>APPLY TO JOIN</a>
                </div>
                <p className="join-fine">
                  OR HEAD STRAIGHT TO <a href={EPHEMERAL_URL}>EPHEMERAL-V2-1.VERCEL.APP</a>
                </p>
              </div>
            </section>
          </>
        )}

        {currentPage === 'cast' && (
          <section id="cast" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">CHARACTER INTROS</div>
              <div className="sect-meta">
                <div className="sect-id">FILE // 001</div>
                <div className="sect-count">{String(CAST.length).padStart(2, '0')} PROFILES</div>
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
              <button className="btn" onClick={() => navigate('chapters')}>NEXT: CHAPTER INDEX</button>
            </div>
          </section>
        )}

        {currentPage === 'chapters' && (
          <section id="chapters" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">CHAPTER INDEX</div>
              <div className="sect-meta">
                <div className="sect-id">FILE // 002</div>
                <div className="sect-count">{TOC.length} ARCS</div>
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
              <button className="btn" onClick={() => navigate('stats')}>NEXT: POWER LEVELS</button>
            </div>
          </section>
        )}

        {currentPage === 'stats' && (
          <section id="stats" style={{ padding: '4rem 0' }}>
            <div className="sect-hdr">
              <div className="sect-ttl">POWER LEVELS</div>
              <div className="sect-meta">
                <div className="sect-id">FILE // 003</div>
                <div className="sect-count">GUILD STATS</div>
              </div>
            </div>

            <div className="status-window">
              <div className="status-col">
                <div className="status-heading mg-sfx">STATS</div>
                {STATS.map((s, i) => (
                  <div className="status-row" key={i}>
                    <span className="status-num">{s.value}</span>
                    <span className="status-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="status-divider" />
              <div className="status-col">
                <div className="status-heading mg-sfx">ACHIEVEMENTS</div>
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
              <button className="btn" onClick={() => navigate('home')}>BACK TO COVER</button>
            </div>
          </section>
        )}

      </div>

      <div className="colophon">
        TECHNICAL COMMITTEE VOL. 01 — ALL RIGHTS RESERVED TO THE GUILD — NEXT VOLUME: TBD
      </div>
    </>
  );
};