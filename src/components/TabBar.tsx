import React from 'react';
import { NavLink } from 'react-router';
import { Gauge, ListChecks, MessageCircle, Receipt, Wallet } from 'lucide-react';
import { Logo } from './Logo';

const TABS = [
  { to: '/snapshot', label: 'Snapshot', icon: Gauge },
  { to: '/my-money', label: 'My Money', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/ask', label: 'Ask', icon: MessageCircle },
  { to: '/get-ready', label: 'Get Ready', icon: ListChecks },
];

export interface TabBarProps {
  openFlagCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({ openFlagCount = 0 }) => (
  <nav
    aria-label="Main"
    className="fixed bottom-0 left-0 right-0 z-30 flex h-tab border-t border-appBorder bg-surface desktop:top-0 desktop:h-auto desktop:w-sidebar desktop:right-auto desktop:flex-col desktop:border-r desktop:border-t-0 desktop:p-3"
  >
    <div className="hidden px-2 pb-4 pt-2 desktop:block">
      <Logo height={32} />
    </div>
    {TABS.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={(event) => {
          if (window.location.pathname === to) {
            event.preventDefault();
            window.scrollTo?.({ top: 0 });
          }
        }}
        className={({ isActive }) =>
          `relative flex min-h-touch flex-1 flex-col items-center justify-center gap-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent desktop:flex-none desktop:flex-row desktop:justify-start desktop:gap-3 desktop:rounded-button desktop:px-3 desktop:py-3 desktop:text-base ${
            isActive ? 'font-semibold text-primary' : 'text-secondaryText'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && <span data-testid="active-bar" className="absolute left-3 right-3 top-0 h-[3px] rounded-pill bg-primary desktop:bottom-2 desktop:left-0 desktop:right-auto desktop:top-2 desktop:h-auto desktop:w-[3px]" />}
            <span className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {to === '/transactions' && openFlagCount > 0 && (
                <span data-testid="tab-badge" className="absolute -right-2 -top-1 min-w-4 rounded-pill bg-appError px-1 text-center text-xs font-semibold text-white">
                  {openFlagCount > 9 ? '9+' : openFlagCount}
                </span>
              )}
            </span>
            {label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);
