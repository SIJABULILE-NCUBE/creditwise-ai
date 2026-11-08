import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleStatusChange = () => setTick((t) => t + 1);

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="w-full bg-pillGreyBg text-pillGreyText px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You&apos;re offline. Changes won&apos;t be saved.</span>
    </div>
  );
};
