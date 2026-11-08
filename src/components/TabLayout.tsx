import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { getOpenFlagCount } from '../lib/api/transactions';
import { onFlagsChanged } from '../lib/flagEvents';
import { TabBar } from './TabBar';

/** Tab bar plus the screen inside it: S6 to S10 and S12. */
export const TabLayout: React.FC = () => {
  const [openFlagCount, setOpenFlagCount] = useState(0);

  useEffect(() => {
    const refresh = async () => setOpenFlagCount((await getOpenFlagCount()) ?? 0);
    void refresh();
    return onFlagsChanged(() => void refresh());
  }, []);

  return (
    <div className="min-h-screen bg-pageBackground pb-tab desktop:pb-0 desktop:pl-sidebar">
      <Outlet />
      <TabBar openFlagCount={openFlagCount} />
    </div>
  );
};
