import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

export interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'normal' | 'error';
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ icon: Icon, label, onClick, variant = 'normal', disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex min-h-14 w-full items-center gap-3 px-1 text-left text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      variant === 'error' ? 'text-appError' : 'text-mainText'
    } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:underline'}`}
  >
    <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
    <span className="flex-1">{label}</span>
    <ChevronRight className="h-5 w-5 shrink-0 text-secondaryText" aria-hidden="true" />
  </button>
);
