import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/Button';

describe('T-C-3 Button component', () => {
  it('T-C-3 renders variants and handles disabled/loading states with 48px height', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button variant="primary" onClick={onClick}>
        Create account
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Create account' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('h-12'); // 48px

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    // Disabled state
    rerender(
      <Button variant="primary" disabled onClick={onClick}>
        Create account
      </Button>
    );
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('opacity-40');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1); // not called again

    // Loading state
    rerender(
      <Button variant="secondary" loading onClick={onClick}>
        Save
      </Button>
    );
    expect(btn).toBeDisabled();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(btn.querySelector('svg')).toBeInTheDocument(); // spinner icon

    // Danger and Danger text variants
    rerender(
      <Button variant="danger">
        Delete
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

    rerender(
      <Button variant="danger-text">
        Delete account
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
  });
});
