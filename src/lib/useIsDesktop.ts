import { useEffect, useState } from 'react';
import { tokens } from '../theme/tokens';

const QUERY = `(min-width: ${tokens.breakpoint.desktop}px)`;

/** For the screens whose content, not just styling, differs on desktop (PRD 9.3). */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() => window.matchMedia?.(QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return;
    const update = () => setDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return desktop;
}
