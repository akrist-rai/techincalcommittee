import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { ApiError } from '../../lib/api';

// Reachable only if you have the exact link (with ?token=...) — there is no
// nav link or button anywhere in the app that points here.
export const Signup: React.FC = () => {
  const { user, loading, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  if (!token) {
    return (
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <div className="admin-auth-title">TECHNICAL COMMITTEE</div>
          <p className="admin-auth-sub">this link is missing its access token — use the exact link you were given.</p>
          <a className="admin-back-link" href="/admin/login">back to login</a>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(token, email, name, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-screen">
      <form className="admin-auth-card" onSubmit={onSubmit}>
        <div className="admin-auth-title">TECHNICAL COMMITTEE</div>
        <p className="admin-auth-sub">create your committee account.</p>

        <label className="admin-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && <div className="admin-error">{error}</div>}

        <button className="admin-btn admin-btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'CREATING…' : 'CREATE ACCOUNT'}
        </button>

        <a className="admin-back-link" href="/admin/login">back to login</a>
      </form>
    </div>
  );
};
