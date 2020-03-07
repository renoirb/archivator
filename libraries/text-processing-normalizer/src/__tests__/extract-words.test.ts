/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { extractWords } from '../extract-words'

import { fixtures } from '.'

describe('extractWords', () => {
  test('Happy-Path', () => {
    const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
      'english-stop-words-alpha.json',
    )
    const textContent = fixtures.loadText('article-alpha.txt')
    const subject = extractWords(textContent, [...stopWords])
    for (const w of stopWords) {
      expect(subject).not.toHaveProperty(w)
    }
    expect(subject).toMatchSnapshot()
  })
})
