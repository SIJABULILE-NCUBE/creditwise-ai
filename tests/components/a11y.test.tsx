import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { GuideCard } from '@/components/GuideCard';
import { Modal } from '@/components/Modal';
import { TabBar } from '@/components/TabBar';
import { TextField } from '@/components/TextField';
import { FlagPill } from '@/components/FlagPill';
import { StatusPill } from '@/components/StatusPill';
import { renderWithRouter, setOnline } from './helpers';
import { guideList } from './guideFixtures';
import { mockLoadedData, mockSetUpData, SCREENS } from './screenList';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/ask');
vi.mock('@/lib/api/guides');

const TALL_ENOUGH = /(^|\s)(h-11|h-12|min-h-touch|min-h-14|min-h-16)(\s|$)/;

function checkInteractive(root: ParentNode) {
  const elements = [...root.querySelectorAll<HTMLElement>('button, a[href]')];
  expect(elements.length).toBeGreaterThan(0);
  for (const element of elements) {
    const name = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
    expect(name, element.outerHTML.slice(0, 120)).not.toBe('');
    expect(element.className, `"${name}" is under 44 px tall`).toMatch(TALL_ENOUGH);
  }
}

describe('T-NFR-3 accessibility', () => {
  beforeEach(() => {
    setOnline(true);
    mockLoadedData();
  });

  it.each(SCREENS)('T-NFR-3 $name: every control has a name and is at least 44 px tall', async (screenCase) => {
    if (screenCase.setUp) mockSetUpData();
    const { container } = render(renderWithRouter(screenCase.ui, { path: screenCase.path, auth: screenCase.auth }));
    await screen.findAllByText(screenCase.ready);
    checkInteractive(container);
  });

  it('T-NFR-3 shared controls have names and size', () => {
    const { container } = render(
      <MemoryRouter>
        <TabBar openFlagCount={3} />
        <GuideCard guide={guideList[0]} onOpen={vi.fn()} />
        <TextField label="Password" type="password" />
        <Modal isOpen onClose={vi.fn()} title="Dialog">
          Body
        </Modal>
      </MemoryRouter>,
    );
    checkInteractive(container);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('T-NFR-3 colour is never the only signal', () => {
    render(
      <>
        <StatusPill band="amber" />
        <FlagPill type="new_payee" status="open" />
      </>,
    );
    expect(screen.getByText('Amber: getting stretched').parentElement?.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('New payee').parentElement?.querySelector('svg')).not.toBeNull();
  });

  it('T-NFR-3 the DTI scale has text for screen readers', async () => {
    const s6 = SCREENS.find((s) => s.name === 'S6')!;
    render(renderWithRouter(s6.ui, { path: s6.path }));
    expect(await screen.findByText('Your DTI is 36%, in the amber band')).toBeInTheDocument();
  });

  it('T-NFR-3 every clickable thing has a keyboard focus outline', () => {
    expect(readFileSync('src/index.css', 'utf8')).toMatch(/:focus-visible[\s\S]*outline: 2px solid theme\('colors\.accent'\)[\s\S]*outline-offset: 2px/);
  });
});
