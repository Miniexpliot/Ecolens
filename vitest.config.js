import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['js/**/*.js'],
      exclude: [
        'js/app.js',
        'js/types.js',
        'js/components/background-3d.js',
        'js/test-runner.js',
        'js/tests.js',
      ],
      all: true
    }
  }
});
