import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { M9PrivacyNotice } from '@/modals/M9PrivacyNotice';
import { setOnline } from './helpers';

describe('M9 Privacy Notice', () => {
  it('T-M9-1 shows the date and the notice text, works offline, and Close returns', () => {
    setOnline(false);
    const onClose = vi.fn();
    render(<M9PrivacyNotice isOpen onClose={onClose} />);
    expect(screen.getByText('Last updated 27 Oct 2026')).toBeInTheDocument();
    for (const heading of ['What we collect', 'Why we collect it', "Where it's stored"]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText(/We do not ask for your ID number, bank account numbers or bank log-in details\./)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' }).at(-1) as HTMLElement);
    expect(onClose).toHaveBeenCalled();
    setOnline(true);
  });
});
