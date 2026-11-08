import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { LoadingPlaceholder } from './components/LoadingPlaceholder';
import { TabLayout } from './components/TabLayout';
import { TabPlaceholder } from './components/TabPlaceholder';
import { AuthProvider, useAuth } from './lib/authContext';
import { S1Welcome } from './pages/S1Welcome';
import { S2SignUp } from './pages/S2SignUp';
import { S3LogIn } from './pages/S3LogIn';
import { S4ForgotPassword } from './pages/S4ForgotPassword';
import { S5SetUp } from './pages/S5SetUp';
import { S6Snapshot } from './pages/S6Snapshot';
import { S7MyMoney } from './pages/S7MyMoney';
import { S11SetNewPassword } from './pages/S11SetNewPassword';
import { S12Account } from './pages/S12Account';

const Loading: React.FC = () => (
  <div className="p-4">
    <LoadingPlaceholder variant="card" />
  </div>
);

/** Logged-out visitors go to S1; an automatic log-out goes to S3 with its banner. */
const SignedOutRedirect: React.FC = () => {
  const { exitReason } = useAuth();
  if (exitReason === 'expired') return <Navigate to="/log-in" replace state={{ banner: 'loggedOut' }} />;
  return <Navigate to="/" replace state={exitReason === 'deleted' ? { deleted: true } : undefined} />;
};

/** S1 to S4: logged out only (Section 11). */
const LoggedOutOnly: React.FC = () => {
  const { loading, session, account, recovery } = useAuth();
  const { search } = useLocation();
  if (recovery) return <Navigate to="/set-new-password" replace />;
  if (search.includes('verified=1')) return <Outlet />;
  if (loading) return <Loading />;
  if (session) return <Navigate to={account?.completed ? '/snapshot' : '/set-up'} replace />;
  return <Outlet />;
};

const SetUpOnly: React.FC = () => {
  const { loading, session, account } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <SignedOutRedirect />;
  if (account?.completed) return <Navigate to="/snapshot" replace />;
  return <Outlet />;
};

const ProfileComplete: React.FC = () => {
  const { loading, session, account } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <SignedOutRedirect />;
  if (!account?.completed) return <Navigate to="/set-up" replace />;
  return <Outlet />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<LoggedOutOnly />}>
      <Route path="/" element={<S1Welcome />} />
      <Route path="/sign-up" element={<S2SignUp />} />
      <Route path="/log-in" element={<S3LogIn />} />
      <Route path="/forgot-password" element={<S4ForgotPassword />} />
    </Route>
    <Route path="/set-new-password" element={<S11SetNewPassword />} />
    <Route element={<SetUpOnly />}>
      <Route path="/set-up" element={<S5SetUp />} />
    </Route>
    <Route element={<ProfileComplete />}>
      <Route element={<TabLayout />}>
        <Route path="/snapshot" element={<S6Snapshot />} />
        <Route path="/my-money" element={<S7MyMoney />} />
        <Route path="/transactions" element={<TabPlaceholder title="Transactions" />} />
        <Route path="/ask" element={<TabPlaceholder title="Ask CreditWise" />} />
        <Route path="/get-ready" element={<TabPlaceholder title="Get Ready" />} />
        <Route path="/account" element={<S12Account />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
