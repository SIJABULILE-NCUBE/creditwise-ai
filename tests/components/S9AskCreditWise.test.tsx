import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ask from '@/lib/api/ask';
import * as money from '@/lib/api/moneyProfile';
import { S9AskCreditWise } from '@/pages/S9AskCreditWise';
import { renderWithRouter, setOnline } from './helpers';
import { ayanda, thando } from './fixtures';

vi.mock('@/lib/api/ask');
vi.mock('@/lib/api/moneyProfile');

const UNAVAILABLE = 'Ask CreditWise is not available right now. Try again in a few minutes.';
const LIMIT = "You've used your 20 questions for today. You can ask again after midnight.";
const history = [
  { id: 'm1', role: 'user' as const, text: 'What car instalment can I afford?', created_at: '2026-10-27T12:05:00Z' },
  { id: 'm2', role: 'assistant' as const, text: 'About R1,000.00.', created_at: '2026-10-27T12:05:10Z' },
];

const open = () => render(renderWithRouter(<S9AskCreditWise />, { path: '/ask' }));
const box = () => screen.getByLabelText('Your question');
const send = () => screen.getByRole('button', { name: 'Send question' });

describe('S9 Ask CreditWise', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(money.getMoneyProfile).mockResolvedValue(thando);
    vi.mocked(ask.getChat).mockReset().mockResolvedValue({ messages: [], questionsLeft: 18 });
    vi.mocked(ask.askQuestion).mockReset().mockResolvedValue({ ok: true, answer: 'Here is your answer.', questionsLeft: 17 });
    vi.mocked(ask.clearChat).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-S9-1 shows the intro, 4 chips, info strip and counters', async () => {
    open();
    expect(await screen.findByText("Ask anything about your Snapshot, your debts or how credit works. I'll use your own numbers.")).toBeInTheDocument();
    for (const chip of ['Why is my DTI amber?', 'What car instalment can I afford?', 'How does a balloon payment work?', 'What happens if I settle my store accounts?']) {
      expect(screen.getByRole('button', { name: chip })).toBeInTheDocument();
    }
    expect(screen.getByText('Ask CreditWise explains your numbers. It does not give financial advice.')).toBeInTheDocument();
    expect(screen.getByText('0/500')).toBeInTheDocument();
    expect(screen.getByText('18 questions left today')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear chat' })).not.toBeInTheDocument();
  });

  it('T-US9-2 tapping a chip sends it as typed; the band word matches the user', async () => {
    vi.mocked(money.getMoneyProfile).mockResolvedValue(ayanda);
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Why is my DTI green?' }));
    await waitFor(() => expect(ask.askQuestion).toHaveBeenCalledWith('Why is my DTI green?'));
    expect(await screen.findByText('Here is your answer.')).toBeInTheDocument();
    expect(screen.getByText('17 questions left today')).toBeInTheDocument();
  });

  it('T-S9-1 shows the typing indicator while waiting, with send disabled', async () => {
    let finish: (v: Awaited<ReturnType<typeof ask.askQuestion>>) => void = () => {};
    vi.mocked(ask.askQuestion).mockReturnValue(new Promise((r) => (finish = r)));
    open();
    await screen.findByText('18 questions left today');
    fireEvent.change(box(), { target: { value: 'Hello' } });
    fireEvent.click(send());
    expect(await screen.findByTestId('typing')).toBeInTheDocument();
    expect(send()).toBeDisabled();
    finish({ ok: true, answer: 'Done.', questionsLeft: 17 });
    expect(await screen.findByText('Done.')).toBeInTheDocument();
  });

  it('T-US9-3 with no questions left shows the limit, disables input and never sends', async () => {
    vi.mocked(ask.getChat).mockResolvedValue({ messages: history, questionsLeft: 0 });
    open();
    expect(await screen.findByText(LIMIT)).toBeInTheDocument();
    expect(box()).toBeDisabled();
    expect(send()).toBeDisabled();
    expect(ask.askQuestion).not.toHaveBeenCalled();
  });

  it('T-US10-3 a failure shows the message and returns the question to the box', async () => {
    vi.mocked(ask.askQuestion).mockResolvedValue({ ok: false, error: UNAVAILABLE, limitReached: false });
    open();
    await screen.findByText('18 questions left today');
    fireEvent.change(box(), { target: { value: 'My question' } });
    fireEvent.click(send());
    expect(await screen.findByText(UNAVAILABLE)).toBeInTheDocument();
    expect(box()).toHaveValue('My question');
    expect(screen.getByText('18 questions left today')).toBeInTheDocument();
  });

  it('T-BR15-1 over 500 characters disables send and shows the message', async () => {
    open();
    await screen.findByText('18 questions left today');
    fireEvent.change(box(), { target: { value: 'a'.repeat(501) } });
    expect(send()).toBeDisabled();
    expect(screen.getByText('Questions can be up to 500 characters.')).toBeInTheDocument();
    expect(screen.getByText('501/500')).toBeInTheDocument();
  });

  it('T-S9-2 Clear chat confirms, removes the messages and shows the Toast', async () => {
    vi.mocked(ask.getChat).mockResolvedValue({ messages: history, questionsLeft: 18 });
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Clear chat' }));
    expect(screen.getByText('Clear this chat?')).toBeInTheDocument();
    expect(screen.getByText("This deletes all your Ask CreditWise messages. It doesn't reset your 20 questions for today.")).toBeInTheDocument();
    vi.mocked(ask.getChat).mockResolvedValue({ messages: [], questionsLeft: 18 });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(await screen.findByText('Chat cleared')).toBeInTheDocument();
    expect(ask.clearChat).toHaveBeenCalled();
    expect(screen.queryByText('About R1,000.00.')).not.toBeInTheDocument();
    expect(screen.getByText('18 questions left today')).toBeInTheDocument();
  });

  it('T-S9-1 Offline disables the input; opening shows placeholders; a load error shows its message', async () => {
    vi.mocked(ask.getChat).mockResolvedValueOnce(null);
    open();
    expect(screen.getByTestId('chat-loading')).toBeInTheDocument();
    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
    setOnline(false);
    await waitFor(() => expect(box()).toBeDisabled());
    setOnline(true);
  });
});
