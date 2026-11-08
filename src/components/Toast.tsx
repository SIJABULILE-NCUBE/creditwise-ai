import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onDismiss,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center max-w-sm px-4 py-2.5 rounded-input bg-toast text-white text-sm font-medium shadow-md transition-opacity duration-200 ${className}`}
    >
      <span className="truncate">{message}</span>
    </div>
  );
};
