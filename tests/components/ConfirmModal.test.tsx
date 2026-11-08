import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from '@/components/ConfirmModal';

describe('T-C-18 ConfirmModal component', () => {
  it('T-C-18 danger button calls confirm, Cancel and Escape call cancel, tapping overlay does nothing', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { getByTestId } = render(
      <ConfirmModal
        isOpen
        title="Delete debt?"
        body="Your Snapshot will update straight away."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Delete debt?')).toBeInTheDocument();
    expect(screen.getByText('Your Snapshot will update straight away.')).toBeInTheDocument();

    // Tapping overlay does nothing
    const overlay = getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(onCancel).not.toHaveBeenCalled();

    // Escape closes modal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(2);

    // Confirm button
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
