import React from 'react';
import { Card } from './Card';
import { formatMoney } from '../lib/money';

export interface StatCardProps {
  label: string;
  value: number;
  note: string;
  warning?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, note, warning }) => (
  <Card className="min-w-0">
    <p className="text-sm text-secondaryText">{label}</p>
    <p className={`mt-1 font-mono text-[28px] font-medium leading-tight ${value < 0 ? 'text-appError' : 'text-mainText'}`}>{formatMoney(value)}</p>
    {warning && <p className="mt-1 text-sm text-appError">{warning}</p>}
    <p className="mt-1 text-sm text-secondaryText">{note}</p>
  </Card>
);
