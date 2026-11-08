import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type ModalVariant = 'dialog' | 'bottomSheet';
export type ModalMaxWidth = '480' | '560' | '720';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  variant?: ModalVariant;
  maxWidth?: ModalMaxWidth;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  variant = 'dialog',
  maxWidth = '560',
  children,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses: Record<ModalMaxWidth, string> = {
    '480': 'tablet:max-w-[480px]',
    '560': 'tablet:max-w-[560px]',
    '720': 'tablet:max-w-[720px]',
  };

  const isBottomSheet = variant === 'bottomSheet';

  return (
    <div
      data-testid="modal-container"
      className={`fixed inset-0 z-50 flex bg-black/50 ${
        isBottomSheet
          ? 'items-end tablet:items-center justify-center'
          : 'items-center justify-center'
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full bg-white border border-appBorder shadow-none overflow-y-auto ${
          isBottomSheet
            ? 'h-auto max-h-[90vh] rounded-t-card tablet:rounded-card p-6'
            : 'h-full tablet:h-auto tablet:max-h-[90vh] tablet:rounded-card p-6'
        } ${maxWidthClasses[maxWidth]} ${className}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-appBorder">
          <h2 id="modal-title" className="text-lg font-semibold text-mainText">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-button text-secondaryText hover:text-mainText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
