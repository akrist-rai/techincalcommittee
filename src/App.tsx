import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './pages/PublicLayout';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { ClubPage } from './pages/ClubPage';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/club/:clubSlug" element={<ClubPage />} />
      <Route path="/:slug" element={<SectionPage />} />
    </Route>

    <Route path="/admin/login" element={<Login />} />
    {/* Both an exact "/admin" route and the "/admin/*" wildcard point at the
        same protected Dashboard — otherwise the bare "/admin" URL is
        ambiguous with the public "/:slug" route (dynamic params can outrank
        wildcards), so it needs its own exact, unambiguously-static match. */}
    <Route
      path="/admin"
      element={(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/*"
      element={(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )}
    />
  </Routes>
);
