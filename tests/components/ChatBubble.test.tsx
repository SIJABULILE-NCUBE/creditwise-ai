import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatBubble, TypingBubble } from '@/components/ChatBubble';

describe('ChatBubble', () => {
  it('T-C-13 user and assistant bubbles, footer, time and 85% max width', () => {
    render(<ChatBubble role="user" text="Hello" time="14:05" />);
    const user = screen.getByText('Hello').parentElement as HTMLElement;
    expect(user.className).toContain('bg-primary');
    expect(user.className).toContain('max-w-[85%]');
    expect(screen.getByText('14:05')).toBeInTheDocument();
    expect(screen.queryByText('Ask CreditWise explains; it does not give financial advice.')).not.toBeInTheDocument();

    render(<ChatBubble role="assistant" text="Answer" time="14:06" />);
    const assistant = screen.getByText('Answer').parentElement as HTMLElement;
    expect(assistant.className).toContain('bg-surface');
    expect(screen.getByText('Ask CreditWise explains; it does not give financial advice.')).toBeInTheDocument();
  });

  it('T-C-13 the typing indicator has 3 dots', () => {
    render(<TypingBubble />);
    expect(screen.getByTestId('typing').querySelectorAll('span')).toHaveLength(3);
  });
});
