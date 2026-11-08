import React from 'react';
import notice from '../../docs/content/privacy-notice.md?raw';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { Modal } from '../components/Modal';

// The file starts with its own title and date, which M9 shows in its header and under it.
const lines = notice.split(/\r?\n/);
const dateLine = lines.find((line) => line.startsWith('Last updated')) ?? '';
const body = lines.filter((line) => !line.startsWith('# ') && line !== dateLine).join('\n');

export const M9PrivacyNotice: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Privacy Notice" maxWidth="720">
    <p className="mb-2 text-sm text-secondaryText">{dateLine}</p>
    <Markdown text={body} />
    <Button variant="secondary" className="mt-4 w-full" onClick={onClose}>
      Close
    </Button>
  </Modal>
);
