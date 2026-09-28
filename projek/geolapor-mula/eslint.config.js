// eslint.config.js — ESLint 9 "flat config" (Hari 4 S3)
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Keselamatan: larang innerHTML/outerHTML — guna textContent / createElement
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Guna textContent atau createElement (elak XSS).' },
        { property: 'outerHTML', message: 'Guna textContent atau createElement (elak XSS).' },
      ],
    },
  },
  { files: ['*.config.js'], languageOptions: { globals: { ...globals.node } } },
  prettier, // mesti terakhir
];
