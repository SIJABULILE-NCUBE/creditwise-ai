import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '@/components/Modal';

describe('T-C-19 Modal / BottomSheet component', () => {
  it('T-C-19 closes on "X" (label "Close") and Escape, and supports bottomSheet variant', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Add debt" maxWidth="480">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Add debt')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    // Full height under 640 px, centred at the given width from the tablet breakpoint up
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('h-full');
    expect(dialog.className).toContain('tablet:h-auto');
    expect(dialog.className).toContain('tablet:max-w-[480px]');
    expect(screen.getByTestId('modal-container').className).toContain('bg-black/50');

    // bottomSheet variant
    rerender(
      <Modal isOpen onClose={onClose} title="Flag Details" variant="bottomSheet">
        <div>Sheet Content</div>
      </Modal>
    );
    expect(screen.getByText('Flag Details')).toBeInTheDocument();
  });
});
