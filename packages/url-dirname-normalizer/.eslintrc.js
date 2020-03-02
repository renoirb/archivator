// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch-eslint6");

const base = require('@renoirb/conventions-use-eslint')

module.exports = {
  extends: [ "@rushstack/eslint-config" ],
  parserOptions: { tsconfigRootDir: __dirname },
  ...base,
  rules: {
    ...(base.rules||{}),
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-delimiter-style.md#require-a-specific-member-delimiter-style-for-interfaces-and-type-literals-member-delimiter-style
        overrides: {
          interface: {
            multiline: {
              delimiter: 'none',
              requireLast: false,
            },
          },
        },
      },
    ],
  },
}
