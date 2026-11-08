import React from 'react';
import { Flag } from 'lucide-react';
import { FLAG_REASONS, type FlagStatus, type FlagType } from '../lib/rules/flags';

const STATUS_WORDS: Partial<Record<FlagStatus, string>> = { querying: 'Querying', dismissed: 'Dismissed', resolved: 'Sorted' };

export const FlagPill: React.FC<{ type: Exclude<FlagType, 'none'>; status: FlagStatus }> = ({ type, status }) => {
  const statusWord = STATUS_WORDS[status];
  const grey = status === 'dismissed' || status === 'resolved';
  return (
    <span data-testid="flag-pill" className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-sm ${grey ? 'bg-pillGreyBg text-pillGreyText' : 'bg-pillAmberBg text-pillAmberText'}`}>
      <Flag className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{statusWord ? `${FLAG_REASONS[type]} · ${statusWord}` : FLAG_REASONS[type]}</span>
    </span>
  );
};
