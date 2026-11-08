import React from 'react';

export interface LoadingPlaceholderProps {
  variant?: 'row' | 'card' | 'bubble' | 'line';
  className?: string;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  variant = 'line',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'row':
        return 'h-14 w-full rounded-card';
      case 'card':
        return 'h-32 w-full rounded-card';
      case 'bubble':
        return 'h-16 w-3/4 rounded-card';
      case 'line':
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <div
      className={`animate-pulse bg-placeholder ${getVariantStyles()} ${className}`}
      aria-hidden="true"
    />
  );
};
