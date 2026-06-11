import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['js/**/*.js'],
      exclude: ['js/app.js', 'js/components/**', 'js/router.js', 'js/tests.test.js', 'js/types.js', 'js/constants.js'],
      all: true
    }
  }
});
