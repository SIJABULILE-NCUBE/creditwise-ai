import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { InitialAvatar } from './InitialAvatar';
import { useAuth } from '../lib/authContext';

/** The Initial avatar in the header of S6 to S10; opens S12 and remembers the tab it came from. */
export const AccountButton: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { account } = useAuth();

  return (
    <button
      type="button"
      aria-label="Account"
      onClick={() => navigate('/account', { state: { from: pathname } })}
      className="flex h-11 w-11 items-center justify-center rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <InitialAvatar name={account?.firstName} />
    </button>
  );
};
