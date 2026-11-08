import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const LIMIT_BYTES = 500 * 1024;

describe('T-NFR-8 first load', () => {
  it('T-NFR-8 the first-load JavaScript and CSS are under 500 KB compressed', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const html = readFileSync('dist/index.html', 'utf8');
    const assets = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
    expect(assets.length).toBeGreaterThanOrEqual(2);
    const total = assets.reduce((sum, asset) => sum + gzipSync(readFileSync(join('dist', asset))).length, 0);
    expect(total).toBeLessThan(LIMIT_BYTES);
  }, 180_000);
});
