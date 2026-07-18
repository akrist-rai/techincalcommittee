import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';
import { CrewGrid, RoadmapList } from '../components/SectionRenderer';

export const ClubPage: React.FC = () => {
  const { clubs, sections } = useSiteData();
  const { clubSlug } = useParams();

  if (!sections) return null;

  const club = clubs.find((c) => c.slug === clubSlug);

  if (!club) {
    return (
      <div className="page-not-found">
        <Link className="page-back" to="/clubs">← Back to clubs</Link>
        <h1>404. Never heard of them.</h1>
      </div>
    );
  }

  const members = club.members ?? [];
  const events = club.events ?? [];

  return (
    <div data-accent={club.accent}>
      <Link className="page-back" to="/clubs">← Back to clubs</Link>

      <section className="clubpage-band">
        <div className="shell">
          <div className="clubpage-grid">
            <div>
              {club.tagline && <span className="clubpage-tagline">{club.tagline}</span>}
              <h1 className="clubpage-name">{club.name}</h1>
              {club.description && <p className="clubpage-desc">{club.description}</p>}
            </div>
            {club.img_url && (
              <div className="clubpage-img"><img src={club.img_url} alt={club.name} /></div>
            )}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell">
          <h2 className="clubpage-sec-title">
            Roster
            <span className="clubpage-sec-count">{String(members.length).padStart(2, '0')} people</span>
          </h2>
          {members.length === 0 ? (
            <p className="clubpage-empty">Nobody's on the roster yet. Could be you.</p>
          ) : (
            <CrewGrid items={members} />
          )}
        </div>
      </section>

      <section className="sec">
        <div className="shell">
          <h2 className="clubpage-sec-title">
            Event plans
            <span className="clubpage-sec-count">{events.length} stops</span>
          </h2>
          {events.length === 0 ? (
            <p className="clubpage-empty">Nothing scheduled yet. Check the committee-wide roadmap in the meantime.</p>
          ) : (
            <RoadmapList items={events} />
          )}
        </div>
      </section>
    </div>
  );
};
