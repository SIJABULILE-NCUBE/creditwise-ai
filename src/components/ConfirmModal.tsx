import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-card bg-white p-6 border border-appBorder"
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-mainText">
          {title}
        </h2>
        <p className="mt-2 text-sm text-secondaryText leading-relaxed">
          {body}
        </p>

        <div className="mt-6 flex flex-col-reverse tablet:flex-row tablet:justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="w-full tablet:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="w-full tablet:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
