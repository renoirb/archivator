/* eslint-env jest */

import { fixtures } from '.'
import { dirnameNormalizer } from '..'

const { loadSlugificationJsonFixture } = fixtures

describe('dirnameNormalizer', () => {
  test('Happy-Path', () => {
    // Yes, let's ignore the protocol
    const subject = dirnameNormalizer('gopher://example.org/Foo/bAr/')
    expect(subject).toBe('example.org/foo/bar')
    // Another edge-case
    expect(
      dirnameNormalizer(
        'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510',
      ),
    ).toBe('example.org/ausername/some-lengthy-string-ending-with-a-hash')
  })

  // @ts-ignore
  test.each(loadSlugificationJsonFixture())(
    '%s:\n\tout:\t\t%s\n\treason:\t\t%s\n\tduration:\t',
    (input, expected) => {
      const output = dirnameNormalizer(input)
      // console.log('run', {output, input, expected, reason: _})
      expect(output).toBe(expected)
    },
  )
})
