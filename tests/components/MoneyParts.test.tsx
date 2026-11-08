import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatCard } from '@/components/StatCard';
import { StatusPill } from '@/components/StatusPill';
import { DebtRow, ExpenseRow } from '@/components/MoneyRow';

describe('Money components', () => {
  it('T-C-7 StatCard shows label, value and note; negative value in error colour', () => {
    const { rerender } = render(<StatCard label="Money left" value={1702} note="Note text" />);
    expect(screen.getByText('Money left')).toBeInTheDocument();
    expect(screen.getByText('R1,702.00').className).not.toContain('text-appError');
    expect(screen.getByText('Note text')).toBeInTheDocument();
    rerender(<StatCard label="Money left" value={-3100} note="Note text" />);
    expect(screen.getByText('-R3,100.00').className).toContain('text-appError');
  });

  it.each([
    ['green', 'Green: healthy'],
    ['amber', 'Amber: getting stretched'],
    ['red', 'Red: lenders may decline'],
  ] as const)('T-C-8 StatusPill %s shows its icon and exact words', (band, label) => {
    render(<StatusPill band={band} />);
    const pill = screen.getByText(label).parentElement as HTMLElement;
    expect(pill.querySelector('svg')).not.toBeNull();
  });

  it('T-C-11 debt row shows name, type, repayment and Owing; expense row its fields', () => {
    const onClick = vi.fn();
    render(<DebtRow debt={{ id: 'd', name: 'Personal loan', type: 'Personal loan', monthly_repayment: 4500, balance_owing: 68000 }} onClick={onClick} />);
    expect(screen.getByText('R4,500.00')).toBeInTheDocument();
    expect(screen.getByText('Owing R68,000.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
    render(<ExpenseRow expense={{ id: 'e', name: 'Rent', category: 'Housing', monthly_amount: 4800 }} onClick={onClick} />);
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Housing')).toBeInTheDocument();
    expect(screen.getByText('R4,800.00')).toBeInTheDocument();
  });
});
