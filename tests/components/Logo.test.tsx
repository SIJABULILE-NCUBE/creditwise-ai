import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/Logo';

describe('T-C-23 Logo component', () => {
  it('T-C-23 shows "CreditWise" and "AI" with the right styling', () => {
    render(<Logo height={32} />);

    expect(screen.getByText('CreditWise')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});
