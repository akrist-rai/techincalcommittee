import React, { useEffect, useState } from 'react';

const LINES = [
  '> TECHNICAL COMMITTEE — TERMINAL',
  '> ls clubs/',
  '  coding-club  enigma  9-bits  fnc  arcadia',
  '> ./roadmap --load',
  '  [OK] clubs        [OK] roster        [OK] roadmap',
  '> ACCESS GRANTED_',
];

const SESSION_KEY = 'tc-booted';
const AUTO_DISMISS_MS = 2400;

// One-time terminal boot splash, shown once per browser tab session on the
// public site. Skips itself entirely under reduced-motion — it's a mood
// beat, not a gate, so it never has a real reason to block anyone.
export const Boot: React.FC = () => {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show || leaving) return undefined;
    document.body.classList.add('lockscroll');
    const t = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    const onKey = () => dismiss();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, leaving]);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setLeaving(true);
    document.body.classList.remove('lockscroll');
    window.setTimeout(() => setShow(false), 500);
  }

  if (!show) return null;

  return (
    <div
      className={`boot${leaving ? ' boot-gone' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onClick={dismiss}
      onKeyDown={dismiss}
    >
      <pre className="boot-log">
        {LINES.map((line, i) => (
          <span key={i} className="boot-line" style={{ '--i': i } as React.CSSProperties}>{line}</span>
        ))}
        <span className="blk" aria-hidden="true" />
      </pre>
      <div className="boot-skip">click / press any key to continue</div>
    </div>
  );
};
