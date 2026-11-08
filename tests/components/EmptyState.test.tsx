import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '@/components/EmptyState';

describe('T-C-20 EmptyState component', () => {
  it('T-C-20 shows illustration, sentence and optional button that calls its action', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        message="No transactions yet."
        actionLabel="Add transactions"
        onAction={onAction}
      />
    );

    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-illustration')).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: 'Add transactions' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
