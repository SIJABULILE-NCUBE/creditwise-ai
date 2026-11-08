import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { FlagPill } from '@/components/FlagPill';
import { TransactionRow } from '@/components/TransactionRow';
import { TabBar } from '@/components/TabBar';
import { gym, salary } from './transactionFixtures';

describe('Transaction components', () => {
  it('T-C-9 amber for open and querying, grey for dismissed and resolved, with the status after the reason', () => {
    const { rerender } = render(<FlagPill type="double_charge" status="open" />);
    const text = () => screen.getByTestId('flag-pill');
    expect(text()).toHaveTextContent('Possible double charge');
    expect(text().textContent).not.toContain('·');
    expect(text().className).toContain('bg-pillAmberBg');
    expect(text().querySelector('svg')).not.toBeNull();
    rerender(<FlagPill type="double_charge" status="querying" />);
    expect(text()).toHaveTextContent('Possible double charge · Querying');
    expect(text().className).toContain('bg-pillAmberBg');
    rerender(<FlagPill type="new_payee" status="dismissed" />);
    expect(text()).toHaveTextContent('New payee · Dismissed');
    expect(text().className).toContain('bg-pillGreyBg');
    rerender(<FlagPill type="higher_than_usual" status="resolved" />);
    expect(text()).toHaveTextContent('Higher than usual · Sorted');
    expect(text().className).toContain('bg-pillGreyBg');
  });

  it('T-C-12 shows amounts and borders; only flagged rows open M4', () => {
    const onOpen = vi.fn();
    render(<TransactionRow transaction={gym} onOpen={onOpen} />);
    const flaggedRow = screen.getByRole('button', { name: /FITZONE GYM DEBIT/ });
    expect(flaggedRow.className).toContain('border-l-4');
    expect(screen.getByText('-R399.00').className).toContain('text-mainText');
    fireEvent.click(flaggedRow);
    expect(onOpen).toHaveBeenCalledWith(gym);

    render(<TransactionRow transaction={salary} onOpen={onOpen} />);
    expect(screen.getByText('+R19,800.00').className).toContain('text-appSuccess');
    expect(screen.queryByRole('button', { name: /SALARY/ })).not.toBeInTheDocument();
  });

  it.each([
    [3, '3'],
    [10, '9+'],
  ])('T-C-2b badge for %i shows %s', (count, text) => {
    render(
      <MemoryRouter>
        <TabBar openFlagCount={count} />
      </MemoryRouter>,
    );
    expect(within(screen.getByRole('link', { name: /Transactions/ })).getByTestId('tab-badge')).toHaveTextContent(text);
  });

  it('T-C-2b badge is hidden at 0', () => {
    render(
      <MemoryRouter>
        <TabBar openFlagCount={0} />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('tab-badge')).not.toBeInTheDocument();
  });
});
