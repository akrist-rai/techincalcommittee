import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { SectionsPanel } from './SectionsPanel';
import { MembersPanel } from './MembersPanel';
import { EventsPanel } from './EventsPanel';
import { MediaPanel } from './MediaPanel';
import { UsersPanel } from './UsersPanel';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">TECHNICAL<em>COMMITTEE</em></div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Sections
          </NavLink>
          <NavLink to="/admin/members" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Members
          </NavLink>
          <NavLink to="/admin/events" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Events
          </NavLink>
          <NavLink to="/admin/media" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Media
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              Users
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-whoami">
            {user?.name} <span className="admin-role-tag">{user?.role}</span>
          </div>
          <a className="admin-back-link" href="/">view site</a>
          <button className="admin-btn admin-btn-ghost" type="button" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route index element={<SectionsPanel />} />
          <Route path="members" element={<MembersPanel />} />
          <Route path="events" element={<EventsPanel />} />
          <Route path="media" element={<MediaPanel />} />
          <Route
            path="users"
            element={(
              <ProtectedRoute requireAdmin>
                <UsersPanel />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  );
};
