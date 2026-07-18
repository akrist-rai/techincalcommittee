import React, { useEffect, useState } from 'react';
import { EventsApi, ClubsApi, ApiError } from '../../lib/api';
import type { Club, EventItem } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

type Draft = Omit<EventItem, 'id' | 'order_index'>;

const EMPTY: Draft = {
  club_id: null, chapter: '', page: '', title: '', tag: '', date_label: '', description: '', img_url: '',
};

function EventEditor({ draft, onChange, clubs }: { draft: Draft; onChange: (d: Draft) => void; clubs: Club[] }) {
  return (
    <div className="admin-card-body">
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Chapter #</span>
          <input value={draft.chapter} onChange={(e) => onChange({ ...draft, chapter: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Page</span>
          <input value={draft.page} onChange={(e) => onChange({ ...draft, page: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Tag</span>
          <input value={draft.tag} onChange={(e) => onChange({ ...draft, tag: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Date</span>
          <input value={draft.date_label} onChange={(e) => onChange({ ...draft, date_label: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Club</span>
          <select
            value={draft.club_id ?? ''}
            onChange={(e) => onChange({ ...draft, club_id: e.target.value || null })}
          >
            <option value="">committee-wide</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <label className="admin-field">
        <span>Title</span>
        <input value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} />
      </label>
      <label className="admin-field">
        <span>Description</span>
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
        />
      </label>
      <MediaPicker
        label="Timeline image"
        value={draft.img_url}
        onChange={(url) => onChange({ ...draft, img_url: url })}
      />
    </div>
  );
}

export const EventsPanel: React.FC = () => {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newDraft, setNewDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => EventsApi.list().then((list) => {
    setEvents(list);
    setDrafts(Object.fromEntries(list.map((e) => [e.id, { ...e }])));
  });

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.'));
    ClubsApi.list().then(setClubs).catch(() => undefined);
  }, []);

  const save = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await EventsApi.update(id, drafts[id]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'save failed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    setBusyId(id);
    try {
      await EventsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (event: EventItem, dir: -1 | 1) => {
    if (!events) return;
    const idx = events.findIndex((e) => e.id === event.id);
    const swapWith = events[idx + dir];
    if (!swapWith) return;
    setBusyId(event.id);
    try {
      await EventsApi.update(event.id, { order_index: swapWith.order_index });
      await EventsApi.update(swapWith.id, { order_index: event.order_index });
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
      await EventsApi.create(newDraft);
      setNewDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'create failed.');
    } finally {
      setBusyId(null);
    }
  };

  if (!events) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Events</h1>
        {!newDraft && (
          <button className="admin-btn admin-btn-primary" onClick={() => setNewDraft({ ...EMPTY })}>
            + Add event
          </button>
        )}
      </div>

      {error && <div className="admin-error">{error}</div>}

      {newDraft && (
        <div className="admin-card admin-card--new">
          <div className="admin-card-header">New event</div>
          <EventEditor draft={newDraft} onChange={setNewDraft} clubs={clubs} />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === '__new__'} onClick={create}>Create</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => setNewDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {events.map((ev, i) => (
        <div className="admin-card" key={ev.id}>
          <div className="admin-card-header">
            <span>{ev.title || 'Untitled'}</span>
            <div className="admin-card-header-actions">
              <button className="admin-btn admin-btn-ghost" disabled={i === 0} onClick={() => move(ev, -1)}>↑</button>
              <button className="admin-btn admin-btn-ghost" disabled={i === events.length - 1} onClick={() => move(ev, 1)}>↓</button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(ev.id)}>Delete</button>
            </div>
          </div>
          <EventEditor
            draft={drafts[ev.id] ?? { ...ev }}
            onChange={(d) => setDrafts((prev) => ({ ...prev, [ev.id]: d }))}
            clubs={clubs}
          />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === ev.id} onClick={() => save(ev.id)}>
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
