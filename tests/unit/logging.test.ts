import { describe, it, expect } from 'vitest';
import { sourceFiles } from './sourceChecks';

const LOG_CALL = /console\.\w+\(([^)]*)\)/g;
const PERSONAL = /password|token|email|csv|amount|income|repayment|question|answer|balance/i;

describe('T-NFR-6 logging', () => {
  it('T-NFR-6 the app and the API log nothing, except the local port line', () => {
    const calls = [...sourceFiles('src'), ...sourceFiles('api')].flatMap((f) => [...f.text.matchAll(LOG_CALL)].map((m) => `${f.path}: ${m[0]}`));
    expect(calls.filter((call) => !call.startsWith('api/dev.ts'))).toEqual([]);
  });

  it('T-NFR-6 nothing that is logged anywhere mentions personal data', () => {
    const args = [...sourceFiles('src'), ...sourceFiles('api'), ...sourceFiles('scripts')].flatMap((f) => [...f.text.matchAll(LOG_CALL)].map((m) => m[1]));
    expect(args.filter((arg) => PERSONAL.test(arg))).toEqual([]);
  });
});
