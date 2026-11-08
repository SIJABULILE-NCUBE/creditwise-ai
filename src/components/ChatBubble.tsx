import React from 'react';

export interface ChatBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, time }) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-card bg-primary p-3 text-white">
          <p className="whitespace-pre-wrap text-base">{text}</p>
          <p className="mt-1 text-right text-xs">{time}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-card border border-appBorder bg-surface p-3 text-mainText">
        <p className="whitespace-pre-wrap text-base">{text}</p>
        <p className="mt-2 text-xs text-secondaryText">Ask CreditWise explains; it does not give financial advice.</p>
        <p className="text-xs text-secondaryText">{time}</p>
      </div>
    </div>
  );
};

export const TypingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div data-testid="typing" className="flex gap-1 rounded-card border border-appBorder bg-surface p-3">
      <span className="h-2 w-2 animate-pulse rounded-pill bg-secondaryText" />
      <span className="h-2 w-2 animate-pulse rounded-pill bg-secondaryText" />
      <span className="h-2 w-2 animate-pulse rounded-pill bg-secondaryText" />
    </div>
  </div>
);
