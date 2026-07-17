import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteApi } from './api';
import type { Club, Section } from './types';
import { uniqueAnchors } from './slug';

interface SiteDataState {
  sections: Section[] | null;
  anchors: string[];
  clubs: Club[];
  error: string | null;
}

const SiteDataContext = createContext<SiteDataState | null>(null);

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    SiteApi.get()
      .then((data) => { if (!cancelled) setSections(data.sections); })
      .catch(() => { if (!cancelled) setError('couldn’t load the page. try refreshing.'); });
    return () => { cancelled = true; };
  }, []);

  const anchors = sections ? uniqueAnchors(sections, (s) => s.title || s.type) : [];
  const clubs = sections?.find((s) => s.type === 'clubs')?.items ?? [];

  return (
    <SiteDataContext.Provider value={{ sections, anchors, clubs, error }}>
      {children}
    </SiteDataContext.Provider>
  );
};

export function useSiteData(): SiteDataState {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used inside SiteDataProvider');
  return ctx;
}
