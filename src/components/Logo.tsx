import React from 'react';

export interface LogoProps {
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ height = 32, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      style={{ height: `${height}px` }}
      data-testid="logo"
    >
      <span className="font-sans font-bold text-primary tracking-tight text-xl leading-none">
        CreditWise
      </span>
      <span className="inline-flex items-center justify-center bg-primary text-white text-xs font-semibold px-1.5 py-0.5 rounded-[4px] leading-none">
        AI
      </span>
    </div>
  );
};
