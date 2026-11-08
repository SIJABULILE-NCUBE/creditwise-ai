import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineBanner } from '@/components/OfflineBanner';

describe('T-C-22 OfflineBanner component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('T-C-22 is visible with message when offline, hidden when online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { rerender } = render(<OfflineBanner />);

    expect(screen.getByText("You're offline. Changes won't be saved.")).toBeInTheDocument();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    rerender(<OfflineBanner />);
    expect(screen.queryByText("You're offline. Changes won't be saved.")).not.toBeInTheDocument();
  });
});
