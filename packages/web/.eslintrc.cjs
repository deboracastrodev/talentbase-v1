/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Import
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'off', // TypeScript handles this
    'import/namespace': 'off', // TypeScript handles this
    'import/default': 'off', // TypeScript handles this
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-duplicates': 'warn',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: [
    'node_modules',
    'build',
    'public/build',
    '.cache',
    'storybook-static',
  ],
};
