import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/test/**/*.spec.ts'],
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],
      css: false,
      restoreMocks: true,
      clearMocks: true,
    },
  })
);
