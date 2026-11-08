import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InitialAvatar } from '@/components/InitialAvatar';

describe('T-C-10 InitialAvatar component', () => {
  it('T-C-10 shows "T" for Thando at 32 px and 56 px; has the label "Account"', () => {
    const { rerender } = render(<InitialAvatar name="Thando" size="sm" />);

    const avatar = screen.getByLabelText('Account');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('T');
    expect(avatar.className).toContain('w-8'); // 32px
    expect(avatar.className).toContain('h-8');

    rerender(<InitialAvatar name="Thando" size="lg" />);
    expect(avatar.className).toContain('w-14'); // 56px
    expect(avatar.className).toContain('h-14');
  });
});
