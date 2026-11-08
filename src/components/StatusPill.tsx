import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { STATUS_LABELS, type StatusBand } from '../lib/calculations';

const STYLES = {
  green: { icon: CheckCircle2, classes: 'bg-pillGreenBg text-pillGreenText' },
  amber: { icon: AlertTriangle, classes: 'bg-pillAmberBg text-pillAmberText' },
  red: { icon: XCircle, classes: 'bg-pillRedBg text-pillRedText' },
};

export const StatusPill: React.FC<{ band: StatusBand }> = ({ band }) => {
  const { icon: Icon, classes } = STYLES[band];
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-sm font-medium ${classes}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{STATUS_LABELS[band]}</span>
    </span>
  );
};
