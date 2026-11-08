import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { S1Welcome } from '@/pages/S1Welcome';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('T-S1-1 S1 Welcome screen', () => {
  it('T-S1-1 shows logo, title, body, 3 benefit rows, buttons, and disclaimer in order', () => {
    render(
      <MemoryRouter>
        <S1Welcome />
      </MemoryRouter>
    );

    // 1. Logo
    expect(screen.getByText('CreditWise')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();

    // 2. Title
    expect(
      screen.getByRole('heading', { level: 1, name: 'See your money the way a lender does.' })
    ).toBeInTheDocument();

    // 3. Body text
    expect(
      screen.getByText(
        'Check your debt-to-income ratio, spot double charges and ask questions in plain English. Free, private and built for South Africans.'
      )
    ).toBeInTheDocument();

    // 4. 3 benefit rows
    expect(screen.getByText('Know your DTI and status band')).toBeInTheDocument();
    expect(screen.getByText('Spot double charges and unusual amounts')).toBeInTheDocument();
    expect(screen.getByText('Ask questions about your own numbers')).toBeInTheDocument();

    // 5. Buttons
    const createAccountBtn = screen.getByRole('button', { name: 'Create account' });
    const logInBtn = screen.getByRole('button', { name: 'Log in' });
    expect(createAccountBtn).toBeInTheDocument();
    expect(logInBtn).toBeInTheDocument();

    // 6. Disclaimer
    expect(
      screen.getByText(
        'CreditWise AI explains and educates. It does not give financial advice or credit.'
      )
    ).toBeInTheDocument();

    // Button interactions
    fireEvent.click(createAccountBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/sign-up');

    fireEvent.click(logInBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/log-in');
  });
});
