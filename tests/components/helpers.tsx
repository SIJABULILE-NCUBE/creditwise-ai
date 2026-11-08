import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { AuthContext, type AuthContextValue } from '@/lib/authContext';

export const thandoAuth: AuthContextValue = {
  loading: false,
  session: { userId: '00000000-0000-0000-0000-000000000001', email: 'thando.nkosi@example.com' },
  account: { firstName: 'Thando', email: 'thando.nkosi@example.com', completed: true, setupStep: 3 },
  recovery: false,
  refreshAccount: async () => {},
  clearRecovery: () => {},
};

export function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
}

export function renderWithRouter(
  ui: React.ReactElement,
  options: { path?: string; initialEntry?: string | { pathname: string; state?: unknown; search?: string }; auth?: AuthContextValue } = {},
) {
  const { path = '/', initialEntry = path, auth = thandoAuth } = options;
  return (
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

export function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}
