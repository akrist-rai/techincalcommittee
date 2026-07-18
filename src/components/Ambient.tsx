import React from 'react';

// Fixed, pointer-events-none atmosphere layer: film grain + a soft vignette.
// Sits above content (SVG noise costs nothing to keep mounted) but never
// blocks interaction. CSS handles the prefers-reduced-motion downgrade.
export const Ambient: React.FC = () => (
  <>
    <div className="amb-grain" aria-hidden="true" />
    <div className="amb-vignette" aria-hidden="true" />
  </>
);
