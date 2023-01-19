// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  ignorePatterns: ['/.yarn', '/dist'],
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};

module.exports = config;
