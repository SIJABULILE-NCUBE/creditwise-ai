import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/Card';

describe('T-C-6 Card component', () => {
  it('T-C-6 renders children with card tokens and no shadow', () => {
    render(
      <Card>
        <p>Card Content</p>
      </Card>
    );

    const card = screen.getByText('Card Content').parentElement;
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain('bg-white');
    expect(card?.className).toContain('border');
    expect(card?.className).toContain('rounded-');
    expect(card?.className).toContain('shadow-none');
  });
});
