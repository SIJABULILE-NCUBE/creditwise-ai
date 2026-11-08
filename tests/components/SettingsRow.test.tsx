import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Key } from 'lucide-react';
import { SettingsRow } from '@/components/SettingsRow';

describe('SettingsRow', () => {
  it('T-C-15 shows icon, label and chevron, calls its action, and has an error-colour variant', () => {
    const onClick = vi.fn();
    const { rerender } = render(<SettingsRow icon={Key} label="Change password" onClick={onClick} />);
    const row = screen.getByRole('button', { name: 'Change password' });
    expect(row.querySelectorAll('svg')).toHaveLength(2);
    expect(row.className).toContain('min-h-14');
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalled();
    rerender(<SettingsRow icon={Key} label="Delete all transactions" onClick={onClick} variant="error" />);
    expect(screen.getByRole('button', { name: 'Delete all transactions' }).className).toContain('text-appError');
  });
});
