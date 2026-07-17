import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';

const GaugeDial: React.FC<{ value: number }> = ({ value }) => <span className="gauge-dial">{value}</span>;

export const ClubPage: React.FC = () => {
  const { clubs, sections } = useSiteData();
  const { clubSlug } = useParams();

  if (!sections) return null;

  const club = clubs.find((c) => c.slug === clubSlug);

  if (!club) {
    return (
      <div className="page-not-found">
        <Link className="page-back" to="/clubs">← back to clubs</Link>
        <h1 className="mg-sfx">404. NEVER HEARD OF THEM.</h1>
      </div>
    );
  }

  const members = club.members ?? [];
  const events = club.events ?? [];

  return (
    <div data-accent={club.accent}>
      <Link className="page-back" to="/clubs">← back to clubs</Link>

      <section className={`panel-block panel-block--${club.img_url ? 'image-right' : 'text-only'}`}>
        {club.img_url && (
          <div className="panel-block-img">
            <img src={club.img_url} alt={club.name} />
          </div>
        )}
        <div className="panel-block-body">
          {club.tagline && <div className="mg-caption"><span className="mg-dot" /> {club.tagline}</div>}
          <h1 className="mg-sfx panel-block-heading">{club.name}</h1>
          {club.description && <p className="panel-block-text">{club.description}</p>}
        </div>
      </section>

      <section style={{ padding: '3rem 0' }}>
        <div className="sect-hdr">
          <div className="sect-ttl">ROSTER</div>
          <div className="sect-meta">
            <div className="sect-count">{String(members.length).padStart(2, '0')} PROFILES</div>
          </div>
        </div>
        {members.length === 0 ? (
          <p className="sect-sub">nobody's signed up on the roster yet. could be you.</p>
        ) : (
          <div className="collage">
            {members.map((m) => (
              <div key={m.id} className={`cast-panel mg-panel cast-panel--${m.size}`}>
                <div className="cast-img-wrap">
                  <span className="cast-role-tag">{m.role}</span>
                  {m.img_url && <img src={m.img_url} alt={m.name} />}
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
        )}
      </section>

      <section style={{ padding: '0 0 3rem' }}>
        <div className="sect-hdr">
          <div className="sect-ttl">EVENT PLANS</div>
          <div className="sect-meta">
            <div className="sect-count">{events.length} STOPS</div>
          </div>
        </div>
        {events.length === 0 ? (
          <p className="sect-sub">nothing scheduled yet. check the committee-wide roadmap in the meantime.</p>
        ) : (
          <div className="roadmap">
            {events.map((t) => (
              <div className="roadmap-item" key={t.id}>
                <div className="roadmap-dot" />
                <div className="roadmap-card mg-panel">
                  <div className="roadmap-card-hdr">
                    <span className="roadmap-chapter">#{t.chapter}</span>
                    <span className="roadmap-tag">{t.tag}</span>
                    <span className="roadmap-date">{t.date_label}</span>
                  </div>
                  <h3 className="roadmap-title mg-sfx">{t.title}</h3>
                  <p className="roadmap-desc">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
