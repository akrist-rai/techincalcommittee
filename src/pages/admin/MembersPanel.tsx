import React, { useEffect, useState } from 'react';
import { MembersApi, ClubsApi, ApiError } from '../../lib/api';
import type { Club, Member } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';
import { StatsEditor } from '../../components/editors';

const EMPTY_MEMBER: Omit<Member, 'id' | 'order_index'> = {
  club_id: null, name: '', role: '', img_url: '', quote: '', stats: [], size: 'md',
};

function MemberEditor({
  draft, onChange, clubs,
}: {
  draft: Omit<Member, 'id' | 'order_index'>;
  onChange: (d: Omit<Member, 'id' | 'order_index'>) => void;
  clubs: Club[];
}) {
  return (
    <div className="admin-card-body">
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Name</span>
          <input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Role</span>
          <input value={draft.role} onChange={(e) => onChange({ ...draft, role: e.target.value })} />
        </label>
        <label className="admin-field">
          <span>Club</span>
          <select
            value={draft.club_id ?? ''}
            onChange={(e) => onChange({ ...draft, club_id: e.target.value || null })}
          >
            <option value="">— none —</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Card size</span>
          <select value={draft.size} onChange={(e) => onChange({ ...draft, size: e.target.value as Member['size'] })}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="wide">Wide</option>
          </select>
        </label>
      </div>

      <label className="admin-field">
        <span>Quote</span>
        <input value={draft.quote ?? ''} onChange={(e) => onChange({ ...draft, quote: e.target.value })} />
      </label>

      <MediaPicker label="Photo" value={draft.img_url} onChange={(url) => onChange({ ...draft, img_url: url })} />

      <div className="admin-field">
        <span>Stats</span>
        <StatsEditor stats={draft.stats} onChange={(stats) => onChange({ ...draft, stats })} />
      </div>
    </div>
  );
}

export const MembersPanel: React.FC = () => {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Omit<Member, 'id' | 'order_index'>>>({});
  const [newDraft, setNewDraft] = useState<Omit<Member, 'id' | 'order_index'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => MembersApi.list().then((list) => {
    setMembers(list);
    setDrafts(Object.fromEntries(list.map((m) => [m.id, { ...m }])));
  });

  useEffect(() => {
    load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.'));
    ClubsApi.list().then(setClubs).catch(() => undefined);
  }, []);

  const save = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await MembersApi.update(id, drafts[id]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'save failed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this member?')) return;
    setBusyId(id);
    try {
      await MembersApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (member: Member, dir: -1 | 1) => {
    if (!members) return;
    const idx = members.findIndex((m) => m.id === member.id);
    const swapWith = members[idx + dir];
    if (!swapWith) return;
    setBusyId(member.id);
    try {
      await MembersApi.update(member.id, { order_index: swapWith.order_index });
      await MembersApi.update(swapWith.id, { order_index: member.order_index });
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
      await MembersApi.create(newDraft);
      setNewDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'create failed.');
    } finally {
      setBusyId(null);
    }
  };

  if (!members) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Members</h1>
        {!newDraft && (
          <button className="admin-btn admin-btn-primary" onClick={() => setNewDraft({ ...EMPTY_MEMBER })}>
            + Add member
          </button>
        )}
      </div>

      {error && <div className="admin-error">{error}</div>}

      {newDraft && (
        <div className="admin-card admin-card--new">
          <div className="admin-card-header">New member</div>
          <MemberEditor draft={newDraft} onChange={setNewDraft} clubs={clubs} />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === '__new__'} onClick={create}>Create</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => setNewDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {members.map((m, i) => (
        <div className="admin-card" key={m.id}>
          <div className="admin-card-header">
            <span>{m.name || 'Untitled'}</span>
            <div className="admin-card-header-actions">
              <button className="admin-btn admin-btn-ghost" disabled={i === 0} onClick={() => move(m, -1)}>↑</button>
              <button className="admin-btn admin-btn-ghost" disabled={i === members.length - 1} onClick={() => move(m, 1)}>↓</button>
              <button className="admin-btn admin-btn-danger" onClick={() => remove(m.id)}>Delete</button>
            </div>
          </div>
          <MemberEditor
            draft={drafts[m.id] ?? { ...m }}
            onChange={(d) => setDrafts((prev) => ({ ...prev, [m.id]: d }))}
            clubs={clubs}
          />
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" disabled={busyId === m.id} onClick={() => save(m.id)}>
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
