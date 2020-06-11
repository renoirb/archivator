/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { Archivable } from '..'

import { fixtures } from '.'

describe('Archivable error handling', () => {
  test.each(fixtures.loadArchiveCsvFixture())('%s', line => {
    expect(() => Archivable.parseLine(line)).not.toThrow()
    expect(() => Archivable.fromLine(line)).not.toThrow()
  })

  // @ts-ignore
  test.each([
    'ლ(́◉◞౪◟◉‵ლ);',
    ';;',
    '',
    '  ;;;;;',
    'invalid-url—string!!#?why%not',
    [],
    () => ({}),
    Number.POSITIVE_INFINITY,
  ])('%s', line => {
    // @ts-ignore
    // We do not validate CSS selectors, but we do validate the URLs.
    expect(() => Archivable.parseLine(line)).toThrow()
    // @ts-ignore
    expect(() => Archivable.fromLine(line)).toThrow()
  })
})

describe('Archivable', () => {
  test('Idempotency', () => {
    const lines = fixtures.loadArchiveCsvFixture()
    for (const line of lines) {
      const parsed = Archivable.parseLine(line)
      const subject = Archivable.fromLine(line)
      const objectified = Archivable.fromLine(line).toJSON()
      const newed = new Archivable(parsed[0], parsed[1], parsed[2])
      expect(newed).toMatchObject(objectified)
      expect(subject).toMatchObject(objectified)
      expect(subject).toHaveProperty('archive')
      expect(subject).toHaveProperty('url', parsed[0])
      // If empty string, we guess we want the full page body. This is deliberate.
      expect(subject).toHaveProperty('selector', parsed[1] ? parsed[1] : 'body')
      // Yes, we also truncate off non content tags too.
      expect(subject).toHaveProperty(
        'truncate',
        `${parsed[2]},script,style,noscript,template`,
      )
    }
  })
})
