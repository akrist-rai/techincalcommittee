import React, { useState } from 'react';

const EPHEMERAL_URL = 'https://ephemeral-v2-1.vercel.app';

interface CastMember {
  name: string;
  role: string;
  img: string;
  quote?: string;
  stats: { label: string; value: number }[];
  size: 'lg' | 'md' | 'sm';
}

const CAST: CastMember[] = [
  { name: 'A. Rai', role: 'Chairperson', img: '/images/luffy.jpeg', quote: '"Ship it, then fix it."',
    stats: [{ label: 'Lead', value: 9 }, { label: 'Vision', value: 8 }], size: 'lg' },
  { name: 'K. Verma', role: 'Vice Chair', img: '/images/zoro.jpeg',
    stats: [{ label: 'Ops', value: 9 }], size: 'md' },
  { name: 'S. Iyer', role: 'Backend Lead', img: '/images/franky.jpeg',
    stats: [{ label: 'Code', value: 10 }], size: 'md' },
  { name: 'P. Nair', role: 'Frontend Lead', img: '/images/sanji.jpeg', stats: [], size: 'sm' },
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
  { ch: '01', page: '004', title: 'Recruitment Arc', tag: 'Onboarding', date: 'Aug 2026',
    desc: 'Open applications, orientation, and the annual "why is git confusing" workshop.' },
  { ch: '02', page: '018', title: 'Hack Night: Origins', tag: 'Hackathon', date: 'Sep 2026',
    desc: '24-hour build sprint. Three teams. One working demo (allegedly).' },
  { ch: '03', page: '033', title: 'Systems Design Dojo', tag: 'Workshop', date: 'Oct 2026',
    desc: 'Whiteboards, load balancers, and a surprising number of anime references.' },
  { ch: '04', page: '051', title: 'Inter-College Clash', tag: 'Competition', date: 'Nov 2026',
    desc: 'We traveled, we competed, we returned with a trophy and zero sleep.' },
  { ch: '05', page: '069', title: 'Merch Drop: Vol. 01', tag: 'Release', date: 'Jan 2027',
    desc: 'First official committee merchandise line ships to members.' },
  { ch: '06', page: '084', title: 'Finale: DemoCon', tag: 'Showcase', date: 'Mar 2027',
    desc: 'Every project from the year, presented in one panel-packed evening.' },
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
  const pct = Math.min(value / max, 1) * 100;
  return (
    <span
      className="gauge-dial"
      style={{ background: `conic-gradient(var(--red) 0% ${pct}%, rgba(255,255,255,.12) ${pct}% 100%)` }}
    >
      {value}
    </span>
  );
};

export const App: React.FC = () => {
  const [tocOpen, setTocOpen] = useState<string | null>(TOC[0].ch);

  return (
    <>
      <div className="scan" />
      <div className="dith" />

      <div className="topbar">
        <span className="tb-logo">TECHNICAL <em>COMMITTEE</em></span>
        <a className="tb-enter" href={EPHEMERAL_URL}>ENTER EPHEMERAL →</a>
      </div>

      <div className="wrap">

        {/* ── Cover ── */}
        <section className="cover mg-speed">
          <div className="cover-bg"><img src="/images/hero-bg.jpeg" alt="" /></div>
          <div className="cover-kanji" aria-hidden="true">技術委員会・第一巻</div>
          <div className="cover-frame">
            <div className="mg-caption vol-tag"><span className="mg-dot" /> VOL. 01 — FIRST PRINTING — 2026</div>
            <h1 className="cover-title mg-sfx mg-sfx-xl">
              <span className="glitch" data-text="TECHNICAL"><span className="hl">TECHNICAL</span></span><br />COMMITTEE
            </h1>
            <p className="cover-sub">
              Builders, breakers, and boss-fight debuggers — the full cast, the chapter
              index, and a way in to Ephemeral.
            </p>
            <div className="cover-cta">
              <a className="btn" href="#cast">MEET THE CAST</a>
              <a className="btn btn-acc" href={EPHEMERAL_URL}>ENTER EPHEMERAL →</a>
            </div>
          </div>
          <div className="scroll-cue">SCROLL ↓ NEXT PANEL</div>
        </section>

        {/* ── Cast ── */}
        <section id="cast" style={{ padding: '4.5rem 0' }}>
          <div className="sect-hdr">
            <div className="sect-ttl">THE CAST</div>
            <div className="sect-id">// CH. 001</div>
            <div className="sect-count">{String(CAST.length).padStart(2, '0')} MEMBERS</div>
          </div>
          <div className="mg-diagonal-rule" />

          <div className="collage">
            {CAST.map((m, i) => (
              <div key={i} className={`cast-panel mg-panel mg-ink-l cast-panel--${m.size}`}>
                <div className="cast-img-wrap">
                  <span className="cast-role-tag">{m.role}</span>
                  <img src={m.img} alt={m.name} />
                </div>
                <div className="cast-body">
                  <div className="cast-name">{m.name}</div>
                  <div className="cast-role">{m.role}</div>
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
        </section>

        {/* ── Table of Contents ── */}
        <section style={{ padding: '4.5rem 0' }}>
          <div className="sect-hdr">
            <div className="sect-ttl">TABLE OF CONTENTS</div>
            <div className="sect-id">// CH. 002</div>
            <div className="sect-count">{TOC.length} CHAPTERS</div>
          </div>
          <div className="mg-diagonal-rule" />

          <div className="toc">
            {TOC.map((t) => (
              <details
                key={t.ch}
                className="toc-row"
                open={tocOpen === t.ch}
                onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setTocOpen(t.ch); }}
              >
                <summary>
                  <span className="toc-ch">{t.ch}</span>
                  <span className="toc-title">{t.title}</span>
                  <span className="toc-leader" />
                  <span className="toc-page">p.{t.page}</span>
                </summary>
                <div className="toc-body">
                  <span className="toc-tag">{t.tag}</span>
                  <span className="toc-date">{t.date}</span>
                  <p className="toc-desc">{t.desc}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Status window ── */}
        <section style={{ padding: '4.5rem 0' }}>
          <div className="sect-hdr">
            <div className="sect-ttl">STATUS WINDOW</div>
            <div className="sect-id">// CH. 003</div>
            <div className="sect-count">GUILD STATS</div>
          </div>
          <div className="mg-diagonal-rule" />

          <div className="status-window mg-panel">
            <div className="status-col">
              <div className="status-heading">STATS</div>
              {STATS.map((s, i) => (
                <div className="status-row" key={i}>
                  <span className="status-num">{s.value}</span>
                  <span className="status-lbl">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="status-divider" />
            <div className="status-col">
              <div className="status-heading">ACHIEVEMENTS</div>
              <div className="badges">
                {BADGES.map((b, i) => (
                  <div className={`badge badge--${b.rarity}`} key={i}>
                    <div className="badge-icon">{b.icon}</div>
                    <span>{b.label}</span>
                    <span className="badge-rarity">{b.rarity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Redirect ── */}
        <section id="join" className="join">
          <div className="join-bg"><img src="/images/finale-bg.jpeg" alt="" /></div>
          <div className="join-inner">
            <div className="stamp">TO BE CONTINUED...</div>
            <h2 className="mg-sfx mg-sfx-xl join-title">NEXT CHAPTER:<br />YOU?</h2>
            <p className="join-sub">
              This page is the committee's front door — everything else, the challenges,
              the leaderboard, the arena, lives on Ephemeral.
            </p>
            <div className="join-links">
              <a className="btn btn-acc" href={EPHEMERAL_URL}>Enter Ephemeral →</a>
              <a className="btn btn-alt" href={`${EPHEMERAL_URL}/members`}>Apply to Join →</a>
            </div>
            <p className="join-fine">
              or head straight to <a href={EPHEMERAL_URL}>ephemeral-v2-1.vercel.app</a>
            </p>
          </div>
        </section>

      </div>

      <div className="colophon">
        TECHNICAL COMMITTEE VOL. 01 — ALL RIGHTS RESERVED TO THE GUILD — NEXT VOLUME: TBD
      </div>
    </>
  );
};
