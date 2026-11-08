import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/lib/money.ts', 'src/lib/calculations.ts', 'src/lib/rules/**/*.ts', 'api/lib/csv.ts'],
      reporter: ['text'],
      thresholds: { lines: 90, perFile: true },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['tests/components/**/*.test.tsx', 'tests/components/**/*.test.ts'],
          setupFiles: ['./tests/setup-components.ts'],
          globals: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          env: loadEnv('', process.cwd(), ''),
          testTimeout: 30000,
        },
      },
    ],
  },
});
