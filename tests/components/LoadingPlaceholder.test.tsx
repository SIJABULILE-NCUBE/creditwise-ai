import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingPlaceholder } from '@/components/LoadingPlaceholder';

describe('T-C-21 LoadingPlaceholder component', () => {
  it('T-C-21 renders row, card, bubble and line shapes with placeholder styling', () => {
    const { container, rerender } = render(<LoadingPlaceholder variant="row" />);
    expect(container.firstChild).toHaveClass('animate-pulse');

    rerender(<LoadingPlaceholder variant="card" />);
    expect(container.firstChild).toHaveClass('animate-pulse');

    rerender(<LoadingPlaceholder variant="bubble" />);
    expect(container.firstChild).toHaveClass('animate-pulse');

    rerender(<LoadingPlaceholder variant="line" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
