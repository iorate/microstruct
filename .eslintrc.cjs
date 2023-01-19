// @ts-check

/** @type { import('eslint').Linter.Config } */
const config = {
  ignorePatterns: ['/.yarn', '/dist'],
  root: true,
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['*.cjs', '*.js'],
      extends: ['eslint:recommended', 'prettier'],
      env: {
        es2022: true,
        node: true,
      },
      overrides: [
        {
          files: ['*.js'],
          parserOptions: {
            sourceType: 'module',
          },
        },
      ],
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
