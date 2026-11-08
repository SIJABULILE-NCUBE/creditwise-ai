import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Banner } from '@/components/Banner';

describe('T-C-16 Banner component', () => {
  it('T-C-16 green and amber variants show their icon and sentence', () => {
    const { rerender } = render(
      <Banner
        variant="green"
        message="Your email is verified. Log in to continue."
      />
    );

    expect(screen.getByText('Your email is verified. Log in to continue.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <Banner
        variant="amber"
        message="Check your email and tap the link to verify your account."
      />
    );

    expect(screen.getByText('Check your email and tap the link to verify your account.')).toBeInTheDocument();
  });
});
