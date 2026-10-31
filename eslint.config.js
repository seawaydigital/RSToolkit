import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .superpowers/ holds git-ignored working files (plan ledgers, test renders);
  // .worktrees/ holds other branches' checkouts, which lint their own files.
  globalIgnores(['dist', '.superpowers', '.worktrees']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      // __TRACKER_ENABLED__ and __SCREENING_ENABLED__ are launch flags, compiled in by vite.config.js.
      globals: { ...globals.browser, __TRACKER_ENABLED__: 'readonly', __SCREENING_ENABLED__: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Pre-existing intentional state-sync effects; surfaced (not silenced) by a
      // newer react-hooks plugin. Kept visible as warnings so the a11y errors are signal.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Config files execute in Node, not the browser — `process` is defined there.
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // node:test files and the tracker maintenance scripts run in Node, not the
    // browser, and use the .mjs extension, so they fall outside the
    // **/*.{js,jsx} block above and would otherwise get zero lint coverage.
    files: ['tests/**/*.mjs', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
