import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.mts'],
      exclude: ['src/index.mts'],
    },
  },
})
