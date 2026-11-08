import { describe, it, expect } from 'vitest';
import { parseCsvImport, selectNewRows, CSV_MESSAGES } from '../../api/lib/csv';

const TODAY = '2026-11-08';
const header = 'date,description,amount\n';

const parse = (csvText: string, fileName = 'bank.csv') => parseCsvImport({ fileName, csvText, today: TODAY });
const rowsOf = (result: ReturnType<typeof parse>) => {
  if ('error' in result) throw new Error(result.error);
  return result;
};

describe('BR9 CSV import', () => {
  it('T-BR9-1 needs the exact header (capitals allowed)', () => {
    expect(rowsOf(parse(`DATE,Description,AMOUNT\n2026-11-01,Shop,-10.00`)).rows).toHaveLength(1);
    expect(parse('tx,desc,amount\n2026-11-01,Shop,-10.00')).toEqual({ error: "This file doesn't match the CreditWise template. Download the template and try again." });
  });

  it('T-BR9-2 skips rows that break the rules and keeps valid ones', () => {
    const bad = [
      '01-11-2026,Bad date,-10.00',
      '2026-13-01,Impossible date,-10.00',
      '2026-11-09,Future,-10.00',
      '2026-08-09,Too old,-10.00',
      '2026-11-01,,-10.00',
      `2026-11-01,${'x'.repeat(81)},-10.00`,
      '2026-11-01,Has R,R10.00',
      '2026-11-01,Has space,10 00',
      '2026-11-01,Three decimals,10.123',
      '2026-11-01,Zero,0',
    ];
    const good = ['2026-11-08,Today,-10.00', '2026-08-10,Oldest allowed,25'];
    const result = rowsOf(parse(header + [...bad, ...good].join('\n')));
    expect(result.rows.map((r) => r.description)).toEqual(['Today', 'Oldest allowed']);
    expect(result.rows.map((r) => r.amount)).toEqual([-10, 25]);
    expect(result.skipped).toBe(10);
  });

  it('T-BR9-2 a quoted comma in an amount is refused', () => {
    expect(rowsOf(parse(`${header}2026-11-01,Comma,"1,000.00"`)).skipped).toBe(1);
  });

  it('T-BR9-3 enforces .csv only, 1 MB and 500 rows with the exact messages', () => {
    expect(parse(header, 'bank.xlsx')).toEqual({ error: CSV_MESSAGES.notCsv });
    expect(CSV_MESSAGES.notCsv).toBe('Please choose a .csv file. In Excel, use Save As and choose CSV.');
    expect(CSV_MESSAGES.tooBig).toBe('This file is bigger than 1 MB or has more than 500 rows. Split it into smaller files.');
    expect(parse(header + 'x'.repeat(1024 * 1024))).toEqual({ error: CSV_MESSAGES.tooBig });
    const rows = (n: number) => header + Array.from({ length: n }, () => '2026-11-01,Shop,-1.00').join('\n');
    expect('error' in parse(rows(500))).toBe(false);
    expect(parse(rows(501))).toEqual({ error: CSV_MESSAGES.tooBig });
  });

  it('T-BR9-4 adds only rows beyond those stored; identical rows in one file are all kept', () => {
    const row = { date: '2026-11-01', description: 'Shop', amount: -10 };
    expect(selectNewRows([row, row], [])).toHaveLength(2);
    expect(selectNewRows([row, row], [row, row])).toHaveLength(0);
    expect(selectNewRows([row, row, row], [row])).toHaveLength(2);
    expect(selectNewRows([{ ...row, amount: -11 }], [row])).toHaveLength(1);
  });

  it('T-NFR-10 formula-like cells stay as plain text', () => {
    const cells = ['=SUM(A1)', '+CMD', '@IMPORT', '-HYPERLINK'];
    const result = rowsOf(parse(header + cells.map((c) => `2026-11-01,${c},-1.00`).join('\n')));
    expect(result.rows.map((r) => r.description)).toEqual(cells);
    result.rows.forEach((r) => expect(typeof r.description).toBe('string'));
  });
});
