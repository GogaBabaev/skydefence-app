import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  test: {
    // Тесты мини-аппа живут только в src/. Папку backend (NestJS/Jest)
    // исключаем явно, иначе Vitest подхватывает её *.spec.ts и падает
    // на jest-глобалах (describe is not defined).
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['backend/**', 'node_modules/**', 'dist/**'],
    passWithNoTests: true,
  },
})
