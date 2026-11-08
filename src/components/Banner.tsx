import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export type BannerVariant = 'green' | 'amber';

export interface BannerProps {
  variant?: BannerVariant;
  message: string;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'green',
  message,
  className = '',
}) => {
  const isGreen = variant === 'green';

  const containerClasses = isGreen
    ? 'bg-pillGreenBg text-pillGreenText border-[#A7E4BA]'
    : 'bg-pillAmberBg text-pillAmberText border-[#FBD38D]';

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 p-3.5 rounded-card border ${containerClasses} text-sm leading-snug ${className}`}
    >
      {isGreen ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-appSuccess mt-0.5" />
      ) : (
        <AlertTriangle className="h-5 w-5 shrink-0 text-appWarning mt-0.5" />
      )}
      <p className="flex-1 font-medium">{message}</p>
    </div>
  );
};
