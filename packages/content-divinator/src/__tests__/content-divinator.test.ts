/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { ContentDivinator } from '../content-divinator'

import { fixtures } from '.'

describe('ContentDivinator', () => {
  test('Happy-Path', () => {
    const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
      'english-stop-words-alpha.json',
    )
    const subject = new ContentDivinator([...stopWords])
    expect(subject).toMatchSnapshot()
    const textContent = fixtures.loadText('article-alpha.txt')
    const textMap = subject.words(textContent)
    expect(textMap).toMatchSnapshot()
    for (const w of stopWords) {
      expect(textMap.has(w)).toBe(false)
    }
  })

  test('factory', () => {
    const subject = ContentDivinator.factory('english', ['en-IN'])
    const textContent = fixtures.loadText('article-charlie.txt')
    const textMap = subject.words(textContent)
    expect(textMap).toMatchSnapshot()
  })
})
