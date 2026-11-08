import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/Header';

describe('T-C-1 Header component', () => {
  it('T-C-1 shows the back arrow or logo, the title, and the right-hand item; back arrow calls its action', () => {
    const onBack = vi.fn();
    const { rerender } = render(
      <Header
        showBack
        onBack={onBack}
        title="Create your account"
        rightAction={<button>Help</button>}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create your account');
    const backBtn = screen.getByRole('button', { name: /back/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Help')).toBeInTheDocument();

    // Rerender with logo instead of back button
    rerender(
      <Header
        showLogo
        title=""
        rightAction={<div>Avatar</div>}
      />
    );
    expect(screen.getByText('CreditWise')).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
  });
});
