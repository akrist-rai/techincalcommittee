import React from 'react';
import { useSiteData } from '../lib/site-data-context';
import { SectionRenderer } from '../components/SectionRenderer';

export const HomePage: React.FC = () => {
  const { sections } = useSiteData();
  if (!sections) return null;

  const about = sections.find((s) => s.type === 'custom' && s.config.variant === 'about');

  if (!about) return null;

  return <SectionRenderer section={about} fileNo={0} />;
};
