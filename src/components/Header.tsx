import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showLogo = false,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-appBorder bg-surface px-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-button text-secondaryText hover:text-mainText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
        {showLogo && <Logo height={32} />}
        {title && (
          <h1 className="text-lg font-semibold text-mainText truncate">
            {title}
          </h1>
        )}
      </div>

      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </header>
  );
};
