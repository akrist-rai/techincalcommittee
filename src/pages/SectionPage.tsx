import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSiteData } from '../lib/site-data-context';
import { SectionRenderer } from '../components/SectionRenderer';
import type { Section } from '../lib/types';

const FILED_TYPES = new Set<Section['type']>(['members', 'events', 'stats']);

export const SectionPage: React.FC = () => {
  const { sections, anchors } = useSiteData();
  const { slug } = useParams();

  if (!sections) return null;

  const index = anchors.findIndex((a) => a === slug);
  const section = index >= 0 ? sections[index] : undefined;
  const isHero = section?.type === 'custom' && section.config.variant === 'hero';

  if (!section || isHero) {
    return (
      <div className="page-not-found">
        <Link className="page-back" to="/">← back home</Link>
        <h1 className="mg-sfx">404. THIS PAGE GHOSTED US.</h1>
      </div>
    );
  }

  let fileNo = 0;
  for (let i = 0; i <= index; i++) {
    if (FILED_TYPES.has(sections[i].type)) fileNo += 1;
  }

  return (
    <>
      <Link className="page-back" to="/">← back home</Link>
      <SectionRenderer section={section} fileNo={fileNo} />
    </>
  );
};
