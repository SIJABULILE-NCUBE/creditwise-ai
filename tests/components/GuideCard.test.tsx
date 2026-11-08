import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GuideCard } from '@/components/GuideCard';
import { guideList } from './guideFixtures';

describe('GuideCard', () => {
  it('T-C-14 shows icon, title, summary, progress and chevron; the whole card is tappable', () => {
    const onOpen = vi.fn();
    render(<GuideCard guide={guideList[0]} onOpen={onOpen} />);
    const card = screen.getByRole('button', { name: /Vehicle finance/ });
    expect(card.querySelectorAll('svg')).toHaveLength(2);
    expect(screen.getByText('Instalments, balloon payments and what dealers check.')).toBeInTheDocument();
    expect(screen.getByText('2 of 6 done')).toBeInTheDocument();
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: `${(2 / 6) * 100}%` });
    fireEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith(guideList[0]);
  });

  it('T-C-14 shows Not started at 0 ticks', () => {
    render(<GuideCard guide={guideList[1]} onOpen={vi.fn()} />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });
});
