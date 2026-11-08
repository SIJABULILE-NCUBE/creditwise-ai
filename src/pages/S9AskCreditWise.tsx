import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { AccountButton } from '../components/AccountButton';
import { Card } from '../components/Card';
import { ChatBubble, TypingBubble } from '../components/ChatBubble';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';
import { askQuestion, clearChat, getChat, type ChatMessage } from '../lib/api/ask';
import { getMoneyProfile } from '../lib/api/moneyProfile';
import { calculateDti, getStatusBand, sumOf, type StatusBand } from '../lib/calculations';
import { formatTime } from '../lib/dates';
import { MESSAGES } from '../lib/messages';
import { LIMIT_REACHED, MAX_QUESTION_LENGTH, QUESTION_TOO_LONG } from '../lib/rules/question';
import { useOnline } from '../lib/useOnline';
import { M8ConfirmDelete } from '../modals/M8ConfirmDelete';

const OTHER_CHIPS = ['What car instalment can I afford?', 'How does a balloon payment work?', 'What happens if I settle my store accounts?'];

export const S9AskCreditWise: React.FC = () => {
  const online = useOnline();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [left, setLeft] = useState<number | null>(null);
  const [band, setBand] = useState<StatusBand>('green');
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getChat().then((chat) => {
      if (!chat) {
        setStatus('error');
        return;
      }
      setMessages(chat.messages);
      setLeft(chat.questionsLeft);
      setStatus('ready');
    });
    void getMoneyProfile().then((data) => {
      if (!data?.profile.grossIncome) return;
      setBand(getStatusBand(calculateDti(sumOf(data.debts, (d) => d.monthly_repayment), data.profile.grossIncome)));
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages, waiting]);

  const limitReached = left === 0;
  const tooLong = input.length > MAX_QUESTION_LENGTH;
  const canSend = online && !waiting && !limitReached && input.trim().length > 0 && !tooLong;

  const send = async (question: string) => {
    if (!online || waiting || limitReached || question.trim().length === 0 || question.length > MAX_QUESTION_LENGTH) return;
    const tempId = `pending-${Date.now()}`;
    setSendError(null);
    setInput('');
    setWaiting(true);
    setMessages((current) => [...current, { id: tempId, role: 'user', text: question, created_at: new Date().toISOString() }]);
    const result = await askQuestion(question);
    setWaiting(false);
    if (result.ok) {
      setLeft(result.questionsLeft);
      setMessages((current) => [...current, { id: `${tempId}-answer`, role: 'assistant', text: result.answer, created_at: new Date().toISOString() }]);
      return;
    }
    setMessages((current) => current.filter((m) => m.id !== tempId));
    setInput(question);
    if (result.limitReached) setLeft(0);
    else setSendError(result.error);
  };

  const chips = [`Why is my DTI ${band}?`, ...OTHER_CHIPS];

  return (
    <>
      <Header
        title="Ask CreditWise"
        rightAction={
          <>
            {messages.length > 0 && (
              <button type="button" onClick={() => setConfirming(true)} className="min-h-touch px-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Clear chat
              </button>
            )}
            <AccountButton />
          </>
        }
      />
      <OfflineBanner />
      <p className="bg-pillGreyBg px-4 py-2 text-sm text-pillGreyText">Ask CreditWise explains your numbers. It does not give financial advice.</p>
      <main className="mx-auto max-w-tablet space-y-3 p-4 pb-48">
        {status === 'loading' && (
          <div data-testid="chat-loading" className="space-y-3">
            <LoadingPlaceholder variant="bubble" />
            <LoadingPlaceholder variant="bubble" />
          </div>
        )}
        {status === 'error' && <p className="text-center text-base text-mainText">{MESSAGES.serverError}</p>}
        {status === 'ready' && messages.length === 0 && !waiting && (
          <>
            <Card className="flex items-start gap-3">
              <MessageCircle className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-base text-mainText">Ask anything about your Snapshot, your debts or how credit works. I&apos;ll use your own numbers.</p>
            </Card>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={!online || limitReached}
                  onClick={() => send(chip)}
                  className="min-h-touch rounded-pill border border-appBorder bg-surface px-4 text-left text-sm text-mainText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>
          </>
        )}
        {messages.map((message) => (
          <ChatBubble key={message.id} role={message.role} text={message.text} time={formatTime(message.created_at)} />
        ))}
        {waiting && <TypingBubble />}
        {sendError && (
          <p role="alert" className="rounded-card border border-appError p-3 text-sm text-appError">
            {sendError}
          </p>
        )}
        <div ref={endRef} />
      </main>

      <form
        className="fixed bottom-tab left-0 right-0 z-20 border-t border-appBorder bg-surface p-3 desktop:bottom-0 desktop:left-sidebar"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <div className="mx-auto max-w-tablet">
          {limitReached && <p className="mb-2 text-sm text-mainText">{LIMIT_REACHED}</p>}
          {tooLong && (
            <p role="alert" className="mb-2 text-sm text-appError">
              {QUESTION_TOO_LONG}
            </p>
          )}
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="ask-question">
              Your question
            </label>
            <textarea
              id="ask-question"
              rows={Math.min(4, Math.max(1, input.split('\n').length))}
              placeholder="Ask about your DTI, debts or credit…"
              value={input}
              disabled={!online || limitReached}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-touch flex-1 resize-none rounded-input border border-inputBorder bg-surface p-3 text-base text-mainText focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={!canSend}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-primary text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1 flex justify-between text-sm text-secondaryText">
            <span>{`${input.length}/${MAX_QUESTION_LENGTH}`}</span>
            {left !== null && <span>{`${left} questions left today`}</span>}
          </div>
        </div>
      </form>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <M8ConfirmDelete
        isOpen={confirming}
        title="Clear this chat?"
        body="This deletes all your Ask CreditWise messages. It doesn't reset your 20 questions for today."
        confirmLabel="Clear"
        onConfirm={clearChat}
        onDone={() => {
          setConfirming(false);
          setMessages([]);
          setToast('Chat cleared');
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};
