import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import { TabBar } from '@/components/TabBar';

function renderAt(path: string, badge?: number) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <TabBar openFlagCount={badge} />
    </MemoryRouter>,
  );
  return screen.getByRole('navigation', { name: 'Main' });
}

describe('TabBar', () => {
  it('T-C-2 shows 5 items in order, marks the active one, and has both layouts', () => {
    const nav = renderAt('/my-money');
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Snapshot', 'My Money', 'Transactions', 'Ask', 'Get Ready']);
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/snapshot', '/my-money', '/transactions', '/ask', '/get-ready']);
    links.forEach((link) => expect(link.querySelector('svg')).not.toBeNull());
    expect(links[1]).toHaveAttribute('aria-current', 'page');
    expect(links[1].className).toContain('text-primary');
    expect(links[1].querySelector('[data-testid="active-bar"]')).not.toBeNull();
    expect(nav.className).toContain('fixed');
    expect(nav.className).toContain('bottom-0');
    expect(nav.className).toContain('desktop:w-sidebar');
    expect(nav.className).toContain('desktop:top-0');
  });

  it('T-C-2 has no active item on S12', () => {
    const nav = renderAt('/account');
    expect(within(nav).getAllByRole('link').filter((l) => l.getAttribute('aria-current'))).toHaveLength(0);
  });
});
