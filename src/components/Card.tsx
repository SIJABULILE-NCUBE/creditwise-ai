import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-appBorder rounded-card p-4 shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
