import React from 'react';
import { Outlet } from 'react-router';
import { TabBar } from './TabBar';

/** Tab bar plus the screen inside it: S6 to S10 and S12. */
export const TabLayout: React.FC = () => (
  <div className="min-h-screen bg-pageBackground pb-tab desktop:pb-0 desktop:pl-sidebar">
    <Outlet />
    <TabBar />
  </div>
);
