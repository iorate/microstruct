// @ts-check

/** @type { import('eslint').Linter.Config } */
const config = {
  root: true,
  ignorePatterns: ['/.yarn', '/dist'],
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['*.cjs'],
      extends: ['eslint:recommended', 'prettier'],
      env: {
        es2022: true,
        node: true,
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
    },
  ],
};

module.exports = config;
