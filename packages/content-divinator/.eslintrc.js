/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@renoirb/conventions-use-eslint')

const main = {
  ...base,
  rules: {
    ...base.rules,
    // TODO: Make this list smaller, not bigger
    // To try it out, comment one line, then run `rushx lint`.
    '@rushstack/no-null': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/member-naming': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/typedef': 'off',
  },
}

module.exports = main
