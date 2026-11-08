import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

describe('T-DB-5 reference data', () => {
  it('T-DB-5 checklist items match docs/content/guides.md word for word', async () => {
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const lines = readFileSync('docs/content/guides.md', 'utf8').split(/\r?\n/);
    const fromFile = lines
      .map((line) => line.match(/^(?:\d+\.|-)\s+((?:I have |I've |My ).+)$/)?.[1]?.trim())
      .filter((text): text is string => Boolean(text));
    const { data, error } = await admin.from('checklist_items').select('text');
    expect(error).toBeNull();
    expect(data!.map((r) => r.text).sort()).toEqual([...fromFile].sort());
  });
});
