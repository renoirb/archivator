/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { fixtures } from '.'

import { parseArchivableCsvLine, Archivable } from '..'

const { loadFixtureArchiveCsvContents } = fixtures

describe('parseArchivableCsvLine() and Archivable#fromLine() error handling', () => {
  test.each(loadFixtureArchiveCsvContents())('%s', line => {
    expect(() => parseArchivableCsvLine(line)).not.toThrow()
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
    Number.POSITIVE_INFINITY
  ])('%s', line => {
    // @ts-ignore
    // We do not validate CSS selectors, but we do validate the URLs.
    expect(() => parseArchivableCsvLine(line)).toThrow()
    // @ts-ignore
    expect(() => Archivable.fromLine(line)).toThrow()
  })
})

describe('Archivable', () => {
  test('Idempotency', () => {
    const fixtures = loadFixtureArchiveCsvContents()
    for (const line of fixtures) {
      const parsed = parseArchivableCsvLine(line)
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
      expect(subject).toHaveProperty('truncate', `${parsed[2]},script,style,noscript,template`)
    }
  })
})
