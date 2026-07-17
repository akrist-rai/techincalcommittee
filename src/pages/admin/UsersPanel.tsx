import React, { useEffect, useState } from 'react';
import { UsersApi, ApiError } from '../../lib/api';
import type { Role, User } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';

const EMPTY = { email: '', name: '', password: '', role: 'editor' as Role };

export const UsersPanel: React.FC = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ ...EMPTY });
  const [creating, setCreating] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  const load = () => UsersApi.list().then(setUsers);

  useEffect(() => { load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.')); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await UsersApi.create(newUser);
      setNewUser({ ...EMPTY });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'create failed.');
    } finally {
      setCreating(false);
    }
  };

  const setRole = async (id: string, role: Role) => {
    setError(null);
    try {
      await UsersApi.update(id, { role });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'update failed.');
    }
  };

  const resetPassword = async (id: string) => {
    const password = passwordDrafts[id];
    if (!password || password.length < 8) {
      setError('new password needs at least 8 characters.');
      return;
    }
    setError(null);
    try {
      await UsersApi.update(id, { password });
      setPasswordDrafts((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'password reset failed.');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this user? They will be signed out immediately.')) return;
    try {
      await UsersApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    }
  };

  if (!users) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card admin-card--new">
        <div className="admin-card-header">Invite a new user</div>
        <form className="admin-card-body" onSubmit={create}>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Name</span>
              <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </label>
            <label className="admin-field">
              <span>Email</span>
              <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </label>
            <label className="admin-field">
              <span>Temporary password</span>
              <input required type="text" minLength={8} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </label>
            <label className="admin-field">
              <span>Role</span>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-primary" type="submit" disabled={creating}>Create user</button>
          </div>
        </form>
      </div>

      {users.map((u) => (
        <div className="admin-card" key={u.id}>
          <div className="admin-card-header">
            <span>{u.name} <span className="admin-hint">({u.email})</span></span>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Role</span>
                <select
                  value={u.role}
                  disabled={u.id === me?.id}
                  onChange={(e) => setRole(u.id, e.target.value as Role)}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Reset password</span>
                <input
                  type="text"
                  placeholder="new password"
                  value={passwordDrafts[u.id] ?? ''}
                  onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                />
              </label>
            </div>
            <div className="admin-card-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => resetPassword(u.id)}>Set password</button>
              {u.id !== me?.id && (
                <button className="admin-btn admin-btn-danger" onClick={() => remove(u.id)}>Remove user</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
