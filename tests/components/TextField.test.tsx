import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TextField } from '@/components/TextField';

describe('T-C-4 TextField component', () => {
  it('T-C-4 shows label, helper text, error state, and password visibility toggle', () => {
    const { rerender } = render(
      <TextField
        label="Password"
        type="password"
        helperText="At least 10 characters, with a letter and a number."
        defaultValue="Secret123"
      />
    );

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('At least 10 characters, with a letter and a number.')).toBeInTheDocument();
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(input.value).toBe('Secret123');

    // Password eye toggle
    const toggleBtn = screen.getByRole('button', { name: /show password|toggle password/i });
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('password');

    // Error state
    rerender(
      <TextField
        label="Password"
        type="password"
        error="At least 10 characters, with a letter and a number."
        defaultValue="Secret123"
      />
    );
    expect(screen.getByText('At least 10 characters, with a letter and a number.')).toBeInTheDocument();
    expect(input.value).toBe('Secret123'); // keeps typed text
  });
});
