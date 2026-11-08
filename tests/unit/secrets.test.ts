import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { sourceFiles } from './sourceChecks';

describe('T-NFR-5 secrets', () => {
  it('T-NFR-5 SERVICE_ROLE and ANTHROPIC_API_KEY never appear in src/', () => {
    const offenders = sourceFiles('src').filter((f) => /SERVICE_ROLE|ANTHROPIC_API_KEY/.test(f.text));
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it('T-NFR-5 src/ reads only VITE_ variables', () => {
    const offenders = sourceFiles('src').filter((f) => /process\.env|import\.meta\.env\.(?!VITE_)/.test(f.text.replace(/import\.meta\.env\.(MODE|DEV|PROD)/g, '')));
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it('T-NFR-5 npm run scan finds no keys', () => {
    expect(() => execSync('npm run scan', { stdio: 'pipe' })).not.toThrow();
  }, 120_000);
});
