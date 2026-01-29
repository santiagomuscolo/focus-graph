import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const config = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/lib/**/*.tsx'],
      exclude: ['src/lib/**/*.test.*', 'src/lib/**/*.spec.*', 'src/lib/**/__tests__/**', 'src/lib/**/index.ts'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig(config as any)
