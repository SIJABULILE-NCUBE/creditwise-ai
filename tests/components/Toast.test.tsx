import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from '@/components/Toast';

describe('T-C-17 Toast component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('T-C-17 shows the text and disappears after 3 seconds', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Your Snapshot is ready." onDismiss={onDismiss} />);

    expect(screen.getByText('Your Snapshot is ready.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2900);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
