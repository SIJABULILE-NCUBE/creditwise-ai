import React from 'react';
import { Car, ChevronRight, CreditCard, HandCoins, type LucideIcon } from 'lucide-react';
import type { GuideSummary } from '../lib/api/guides';
import { checklistProgress } from '../lib/rules/checklist';

const ICONS: Record<string, LucideIcon> = { car: Car, 'hand-coins': HandCoins, 'credit-card': CreditCard };

export const GuideCard: React.FC<{ guide: GuideSummary; onOpen: (guide: GuideSummary) => void }> = ({ guide, onOpen }) => {
  const Icon = ICONS[guide.icon] ?? Car;
  return (
    <button
      type="button"
      onClick={() => onOpen(guide)}
      className="flex w-full items-center gap-3 rounded-card border border-appBorder bg-surface p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold text-mainText">{guide.title}</span>
        <span className="block text-sm text-secondaryText">{guide.summary}</span>
        <span className="mt-2 block h-2 rounded-pill bg-placeholder">
          <span data-testid="progress-fill" className="block h-2 rounded-pill bg-primary" style={{ width: `${(guide.done / guide.total) * 100}%` }} />
        </span>
        <span className="mt-1 block text-sm text-secondaryText">{checklistProgress(guide.done, guide.total)}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-secondaryText" aria-hidden="true" />
    </button>
  );
};
