import React from 'react';
import type { BadgeItem, SectionButton, StatItem } from '../lib/types';

export function StatsEditor({ stats, onChange }: { stats: StatItem[]; onChange: (stats: StatItem[]) => void }) {
  return (
    <div className="array-editor">
      {stats.map((s, i) => (
        <div className="array-editor-row" key={i}>
          <input
            placeholder="label"
            value={s.label}
            onChange={(e) => onChange(stats.map((row, j) => (j === i ? { ...row, label: e.target.value } : row)))}
          />
          <input
            type="number"
            placeholder="value"
            value={s.value}
            onChange={(e) => onChange(stats.map((row, j) => (j === i ? { ...row, value: Number(e.target.value) } : row)))}
          />
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange(stats.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange([...stats, { label: '', value: 0 }])}>
        + add stat
      </button>
    </div>
  );
}

export function BadgesEditor({ badges, onChange }: { badges: BadgeItem[]; onChange: (badges: BadgeItem[]) => void }) {
  return (
    <div className="array-editor">
      {badges.map((b, i) => (
        <div className="array-editor-row" key={i}>
          <input
            className="array-editor-icon"
            placeholder="🏆"
            value={b.icon}
            onChange={(e) => onChange(badges.map((row, j) => (j === i ? { ...row, icon: e.target.value } : row)))}
          />
          <input
            placeholder="label"
            value={b.label}
            onChange={(e) => onChange(badges.map((row, j) => (j === i ? { ...row, label: e.target.value } : row)))}
          />
          <select
            value={b.rarity}
            onChange={(e) => onChange(badges.map((row, j) => (j === i ? { ...row, rarity: e.target.value as BadgeItem['rarity'] } : row)))}
          >
            <option value="common">common</option>
            <option value="rare">rare</option>
            <option value="legendary">legendary</option>
          </select>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange(badges.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={() => onChange([...badges, { icon: '🏆', label: '', rarity: 'common' }])}
      >
        + add badge
      </button>
    </div>
  );
}

export function ButtonsEditor({ buttons, onChange }: { buttons: SectionButton[]; onChange: (buttons: SectionButton[]) => void }) {
  return (
    <div className="array-editor">
      {buttons.map((btn, i) => (
        <div className="array-editor-row" key={i}>
          <input
            placeholder="label"
            value={btn.label}
            onChange={(e) => onChange(buttons.map((row, j) => (j === i ? { ...row, label: e.target.value } : row)))}
          />
          <input
            placeholder="https://…"
            value={btn.href}
            onChange={(e) => onChange(buttons.map((row, j) => (j === i ? { ...row, href: e.target.value } : row)))}
          />
          <select
            value={btn.style ?? 'primary'}
            onChange={(e) => onChange(buttons.map((row, j) => (j === i ? { ...row, style: e.target.value as SectionButton['style'] } : row)))}
          >
            <option value="primary">primary</option>
            <option value="accent">accent</option>
          </select>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange(buttons.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      {buttons.length < 4 && (
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={() => onChange([...buttons, { label: '', href: '', style: 'primary' }])}
        >
          + add button
        </button>
      )}
    </div>
  );
}
