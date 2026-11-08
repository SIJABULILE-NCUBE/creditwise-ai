import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      data-testid="empty-state"
    >
      <svg
        data-testid="empty-state-illustration"
        className="w-[120px] h-[120px] text-appBorder stroke-current fill-none mb-4"
        viewBox="0 0 120 120"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="20" y="24" width="80" height="72" rx="8" />
        <line x1="36" y1="44" x2="84" y2="44" />
        <line x1="36" y1="60" x2="68" y2="60" />
        <line x1="36" y1="76" x2="52" y2="76" />
      </svg>

      <p className="text-base text-secondaryText max-w-sm mb-6">{message}</p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
