import React from 'react';

export interface InitialAvatarProps {
  name?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export const InitialAvatar: React.FC<InitialAvatarProps> = ({
  name = '',
  size = 'sm',
  className = '',
}) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  const sizeClasses = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-8 h-8 text-sm';

  return (
    <div
      role="img"
      aria-label="Account"
      className={`inline-flex items-center justify-center rounded-full bg-primary text-white font-sans font-semibold select-none ${sizeClasses} ${className}`}
    >
      {initial}
    </div>
  );
};
