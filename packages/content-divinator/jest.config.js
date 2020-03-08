/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@renoirb/conventions-use-jest')

const exporting = {
  ...base,
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$',
  prettierPath: './node_modules/@renoirb/conventions-use-prettier/bin/prettier',
}

module.exports = exporting
