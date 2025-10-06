import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      exclude: [
        'coverage/**',
        'playground/**',
        'dist/**',
        '**/node_modules/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,tsdown,build,eslint,prettier}.config.*',
      ],
    },
  },
});
