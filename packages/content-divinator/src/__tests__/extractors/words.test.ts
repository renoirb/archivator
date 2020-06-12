/* eslint-env jest */

import { words, summary } from '../../extractors'

import { fixtures } from '..'

describe('extractors', () => {
  const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
    'english-stop-words-alpha.json',
  )
  const textContent = fixtures.loadText('article-alpha.txt')

  test('Happy-Path', () => {
    const subject = words(textContent, [...stopWords])
    for (const w of stopWords) {
      expect(subject).not.toHaveProperty(w)
    }
    expect(subject).toMatchSnapshot()
  })

  test('When adding stopWords', () => {
    // We're removing 'to' as a stop word
    const textHashMap = words(textContent, [...stopWords, 'to'])
    // But 'to' should be present in the top 20 of the words used at least 10 times
    const summarized = summary(textHashMap, 10, 20)
    expect(summarized).toMatchSnapshot()
    expect(summarized.keywords).toMatchObject([
      // 'to',
      'api',
      'the',
      'data',
      'that',
      'in',
      'return',
    ])
  })
})
