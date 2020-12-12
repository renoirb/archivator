/**
 * Copy-Pasta from @renoirb/conventions-use-prettier at v1.3.0
 *
 * https://github.com/renoirb/experiments-201908-rush-typescript-just-bili-monorepo/blob/%40renoirb/conventions-use-prettier_v1.3.0/conventions/use-prettier/prettier.config.js
 *
 * @type {import('prettier').RequiredOptions}
 */
const main = {
  endOfLine: 'lf',
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  overrides: [
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always'
      },
    },
  ],
}

module.exports = main

