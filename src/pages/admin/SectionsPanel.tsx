import React, { useEffect, useState } from 'react';
import { SectionsApi, ApiError } from '../../lib/api';
import type { Accent, CustomConfig, Section, SectionType, StatsConfig } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';
import { BadgesEditor, ButtonsEditor, StatsEditor } from '../../components/editors';

interface Draft {
  type: SectionType;
  title: string;
  subtitle: string;
  visible: boolean;
  accent: Accent;
  config: Record<string, unknown>;
}

const ACCENTS: Accent[] = ['red', 'cyan', 'yellow', 'violet', 'green'];

function toDraft(s: Section): Draft {
  return {
    type: s.type, title: s.title, subtitle: s.subtitle, visible: s.visible, accent: s.accent,
    config: s.config as Record<string, unknown>,
  };
}

const NEW_SECTION_DEFAULTS: Record<SectionType, Draft> = {
  members: { type: 'members', title: 'The Club', subtitle: '', visible: true, accent: 'violet', config: {} },
  events: { type: 'events', title: 'Roadmap', subtitle: '', visible: true, accent: 'yellow', config: {} },
  stats: {
    type: 'stats', title: 'Stats', subtitle: '', visible: true, accent: 'cyan',
    config: { stats: [], badges: [] } satisfies StatsConfig,
  },
  custom: {
    type: 'custom', title: 'New Panel', subtitle: '', visible: true, accent: 'red',
    config: { variant: 'panel', heading: '', body: '', layout: 'text-only', buttons: [] } satisfies CustomConfig,
  },
};

const TYPE_LABELS: Record<SectionType, string> = {
  members: 'Members grid',
  events: 'Event timeline',
  stats: 'Stats & badges',
  custom: 'Text / image panel',
};

function SectionEditor({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  const config = draft.config;

  return (
    <div className="admin-card-body">
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Title</span>
          <input value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Subtitle</span>
          <input value={draft.subtitle} onChange={(e) => onChange({ ...draft, subtitle: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Accent color</span>
          <select value={draft.accent} onChange={(e) => onChange({ ...draft, accent: e.target.value as Accent })}>
            {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      {(draft.type === 'members' || draft.type === 'events') && (
        <p className="admin-hint">
          This section shows the full {draft.type === 'members' ? 'roster' : 'timeline'} — manage the actual
          {draft.type === 'members' ? ' members' : ' events'} under the {draft.type === 'members' ? 'Members' : 'Events'} tab.
        </p>
      )}

      {draft.type === 'stats' && (
        <>
          <div className="admin-field">
            <span>Stats</span>
            <StatsEditor
              stats={(config.stats as StatsConfig['stats']) ?? []}
              onChange={(stats) => onChange({ ...draft, config: { ...config, stats } })}
            />
          </div>
          <div className="admin-field">
            <span>Badges</span>
            <BadgesEditor
              badges={(config.badges as StatsConfig['badges']) ?? []}
              onChange={(badges) => onChange({ ...draft, config: { ...config, badges } })}
            />
          </div>
        </>
      )}

      {draft.type === 'custom' && (
        <>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Variant</span>
              <select
                value={(config.variant as string) ?? 'panel'}
                onChange={(e) => onChange({ ...draft, config: { ...config, variant: e.target.value } })}
              >
                <option value="panel">Panel (freeform)</option>
                <option value="hero">Hero (cover)</option>
                <option value="cta">CTA (finale)</option>
              </select>
            </label>
            {config.variant === 'panel' && (
              <label className="admin-field">
                <span>Layout</span>
                <select
                  value={(config.layout as string) ?? 'text-only'}
                  onChange={(e) => onChange({ ...draft, config: { ...config, layout: e.target.value } })}
                >
                  <option value="text-only">Text only</option>
                  <option value="image-left">Image left</option>
                  <option value="image-right">Image right</option>
                  <option value="image-full">Image full-bleed</option>
                </select>
              </label>
            )}
          </div>

          <label className="admin-field">
            <span>Eyebrow (small caption above heading)</span>
            <input
              value={(config.eyebrow as string) ?? ''}
              onChange={(e) => onChange({ ...draft, config: { ...config, eyebrow: e.target.value } })}
            />
          </label>
          <label className="admin-field">
            <span>Corner badge (e.g. COMING SOON — leave blank for none)</span>
            <input
              value={(config.badge as string) ?? ''}
              onChange={(e) => onChange({ ...draft, config: { ...config, badge: e.target.value } })}
            />
          </label>
          <label className="admin-field">
            <span>Heading</span>
            <input
              value={(config.heading as string) ?? ''}
              onChange={(e) => onChange({ ...draft, config: { ...config, heading: e.target.value } })}
            />
          </label>
          <label className="admin-field">
            <span>Body</span>
            <textarea
              rows={3}
              value={(config.body as string) ?? ''}
              onChange={(e) => onChange({ ...draft, config: { ...config, body: e.target.value } })}
            />
          </label>

          <MediaPicker
            label="Image"
            value={(config.imageUrl as string) ?? ''}
            onChange={(url) => onChange({ ...draft, config: { ...config, imageUrl: url } })}
          />
          <label className="admin-field">
            <span>Image alt text</span>
            <input
              value={(config.imageAlt as string) ?? ''}
              onChange={(e) => onChange({ ...draft, config: { ...config, imageAlt: e.target.value } })}
            />
          </label>

          <div className="admin-field">
            <span>Buttons</span>
            <ButtonsEditor
              buttons={(config.buttons as CustomConfig['buttons']) ?? []}
              onChange={(buttons) => onChange({ ...draft, config: { ...config, buttons } })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export const SectionsPanel: React.FC = () => {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => SectionsApi.list().then((list) => {
    setSections(list);
    setDrafts(Object.fromEntries(list.map((s) => [s.id, toDraft(s)])));
  });

  useEffect(() => { load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.')); }, []);

  const save = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const d = drafts[id];
      await SectionsApi.update(id, { title: d.title, subtitle: d.subtitle, visible: d.visible, accent: d.accent, config: d.config });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'save failed.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisible = async (s: Section) => {
    setBusyId(s.id);
    try {
      await SectionsApi.update(s.id, { visible: !s.visible });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this section from the page? (Members/events data itself is not deleted.)')) return;
    setBusyId(id);
    try {
      await SectionsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (section: Section, dir: -1 | 1) => {
    if (!sections) return;
    const idx = sections.findIndex((s) => s.id === section.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const order = sections.map((s) => s.id);
    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    setBusyId(section.id);
    try {
      await SectionsApi.reorder(order);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'reorder failed.');
    } finally {
      setBusyId(null);
    }
  };

  const addSection = async (type: SectionType) => {
    setPickerOpen(false);
    setError(null);
    try {
      const d = NEW_SECTION_DEFAULTS[type];
      await SectionsApi.create(d);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'create failed.');
    }
  };

  if (!sections) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sections</h1>
        <div style={{ position: 'relative' }}>
          <button className="admin-btn admin-btn-primary" onClick={() => setPickerOpen((v) => !v)}>+ Add section</button>
          {pickerOpen && (
            <div className="section-type-picker">
              {(Object.keys(TYPE_LABELS) as SectionType[]).map((t) => (
                <button key={t} type="button" onClick={() => addSection(t)}>{TYPE_LABELS[t]}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="admin-hint">
        This is the page, top to bottom. Reorder, hide, or remove sections — visitors only see what's visible, in this order.
      </p>

      {error && <div className="admin-error">{error}</div>}

      {sections.map((s, i) => (
        <div className={`admin-card${s.visible ? '' : ' admin-card--hidden'}`} key={s.id}>
          <div className="admin-card-header">
            <span>
              <span className="admin-type-tag">{TYPE_LABELS[s.type]}</span>
              {s.title || 'Untitled section'}
              {!s.visible && <span className="admin-hint"> (hidden)</span>}
            </span>
            <div className="admin-card-header-actions">
              <button className="admin-btn admin-btn-ghost" disabled={i === 0} onClick={() => move(s, -1)}>↑</button>
              <button className="admin-btn admin-btn-ghost" disabled={i === sections.length - 1} onClick={() => move(s, 1)}>↓</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => toggleVisible(s)}>
                {s.visible ? 'Hide' : 'Show'}
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(s.id)}>Delete</button>
            </div>
          </div>
          <SectionEditor
            draft={drafts[s.id] ?? toDraft(s)}
            onChange={(d) => setDrafts((prev) => ({ ...prev, [s.id]: d }))}
          />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === s.id} onClick={() => save(s.id)}>
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
