import React, { useEffect, useState } from 'react';
import { ClubsApi, ApiError } from '../../lib/api';
import type { Accent, Club } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';
import { slugify } from '../../lib/slug';

type Draft = Omit<Club, 'id' | 'order_index' | 'members' | 'events'>;

const EMPTY: Draft = { name: '', slug: '', tagline: '', description: '', img_url: '', accent: 'red' };
const ACCENTS: Accent[] = ['red', 'cyan', 'yellow', 'violet', 'green'];

function ClubEditor({ draft, onChange, isNew }: { draft: Draft; onChange: (d: Draft) => void; isNew: boolean }) {
  return (
    <div className="admin-card-body">
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Name</span>
          <input
            value={draft.name}
            onChange={(e) => {
              const name = e.target.value;
              // auto-fill the slug from the name until someone's touched it directly
              const shouldAutoSlug = isNew && (draft.slug === '' || draft.slug === slugify(draft.name, ''));
              onChange({ ...draft, name, slug: shouldAutoSlug ? slugify(name, '') : draft.slug });
            }}
          />
        </label>
        <label className="admin-field">
          <span>Slug (URL: /club/…)</span>
          <input value={draft.slug} onChange={(e) => onChange({ ...draft, slug: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Accent color</span>
          <select value={draft.accent} onChange={(e) => onChange({ ...draft, accent: e.target.value as Accent })}>
            {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      <label className="admin-field">
        <span>Tagline</span>
        <input value={draft.tagline} onChange={(e) => onChange({ ...draft, tagline: e.target.value })} />
      </label>
      <label className="admin-field">
        <span>Description</span>
        <textarea rows={3} value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} />
      </label>

      <MediaPicker label="Header image (optional)" value={draft.img_url} onChange={(url) => onChange({ ...draft, img_url: url })} />
    </div>
  );
}

export const ClubsPanel: React.FC = () => {
  const [clubs, setClubs] = useState<Club[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newDraft, setNewDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => ClubsApi.list().then((list) => {
    setClubs(list);
    setDrafts(Object.fromEntries(list.map((c) => [c.id, { ...c }])));
  });

  useEffect(() => { load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.')); }, []);

  const save = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await ClubsApi.update(id, drafts[id]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'save failed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this club? Its members/events stay, just un-clubbed.')) return;
    setBusyId(id);
    try {
      await ClubsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (club: Club, dir: -1 | 1) => {
    if (!clubs) return;
    const idx = clubs.findIndex((c) => c.id === club.id);
    const swapWith = clubs[idx + dir];
    if (!swapWith) return;
    setBusyId(club.id);
    try {
      await ClubsApi.update(club.id, { order_index: swapWith.order_index });
      await ClubsApi.update(swapWith.id, { order_index: club.order_index });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'reorder failed.');
    } finally {
      setBusyId(null);
    }
  };

  const create = async () => {
    if (!newDraft) return;
    setBusyId('__new__');
    setError(null);
    try {
      await ClubsApi.create(newDraft);
      setNewDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'create failed.');
    } finally {
      setBusyId(null);
    }
  };

  if (!clubs) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Clubs</h1>
        {!newDraft && (
          <button className="admin-btn admin-btn-primary" onClick={() => setNewDraft({ ...EMPTY })}>
            + Add club
          </button>
        )}
      </div>

      <p className="admin-hint">
        Assign members and events to a club from the Members / Events tabs. Deleting a club here doesn't delete its
        people or events — they just go back to committee-wide.
      </p>

      {error && <div className="admin-error">{error}</div>}

      {newDraft && (
        <div className="admin-card admin-card--new">
          <div className="admin-card-header">New club</div>
          <ClubEditor draft={newDraft} onChange={setNewDraft} isNew />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === '__new__'} onClick={create}>Create</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => setNewDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {clubs.map((c, i) => (
        <div className="admin-card" key={c.id}>
          <div className="admin-card-header">
            <span>{c.name || 'Untitled'} <span className="admin-hint">/club/{c.slug}</span></span>
            <div className="admin-card-header-actions">
              <button className="admin-btn admin-btn-ghost" disabled={i === 0} onClick={() => move(c, -1)}>↑</button>
              <button className="admin-btn admin-btn-ghost" disabled={i === clubs.length - 1} onClick={() => move(c, 1)}>↓</button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
          <ClubEditor
            draft={drafts[c.id] ?? { ...c }}
            onChange={(d) => setDrafts((prev) => ({ ...prev, [c.id]: d }))}
            isNew={false}
          />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === c.id} onClick={() => save(c.id)}>
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
