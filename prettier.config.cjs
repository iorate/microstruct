// @ts-check

/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'avoid',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
  ],
};

module.exports = config;
