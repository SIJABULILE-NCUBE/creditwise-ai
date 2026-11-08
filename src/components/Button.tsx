import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-text';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex h-12 items-center justify-center rounded-button px-5 font-sans text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
    secondary: 'bg-white text-primary border border-primary hover:bg-pageBackground active:bg-pageBackground',
    danger: 'bg-appError text-white hover:opacity-90 active:opacity-90',
    'danger-text': 'bg-transparent text-appError hover:bg-pillRedBg active:bg-pillRedBg',
  };

  const isDisabled = disabled || loading;
  const stateClasses = isDisabled
    ? 'opacity-40 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
      )}
      <span>{children}</span>
    </button>
  );
};
