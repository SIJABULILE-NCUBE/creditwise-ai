import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MoneyField } from '@/components/MoneyField';

describe('T-C-5 MoneyField component', () => {
  it('T-C-5 shows "R" prefix, uses inputMode="decimal", and formats value with thousands separators after blur', () => {
    const onChange = vi.fn();
    render(
      <MoneyField
        label="Monthly income before deductions"
        value="25000"
        onChange={onChange}
      />
    );

    expect(screen.getByText('R')).toBeInTheDocument();
    const input = screen.getByLabelText('Monthly income before deductions') as HTMLInputElement;
    expect(input.inputMode).toBe('decimal');

    // Blur formatting
    fireEvent.blur(input);
    expect(input.value).toBe('25,000.00');
  });
});
