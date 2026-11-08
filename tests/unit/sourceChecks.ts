import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every .ts and .tsx file under a folder, with its text. */
export function sourceFiles(dir: string): { path: string; text: string }[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [{ path: path.replace(/\\/g, '/'), text: readFileSync(path, 'utf8') }] : [];
  });
}
