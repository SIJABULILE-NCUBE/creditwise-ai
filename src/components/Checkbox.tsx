import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ children, className = '', disabled, ...props }) => (
  <label className={`flex min-h-touch items-center gap-3 text-base text-mainText ${disabled ? 'opacity-40' : 'cursor-pointer'} ${className}`}>
    <input
      type="checkbox"
      disabled={disabled}
      className="h-5 w-5 shrink-0 rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      {...props}
    />
    <span>{children}</span>
  </label>
);
