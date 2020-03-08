/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { extractWords, summarize } from '../extract-words'

import { fixtures } from '.'

describe('extract-words', () => {
  const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
    'english-stop-words-alpha.json',
  )
  const textContent = fixtures.loadText('article-alpha.txt')

  test('extractWords', () => {
    const subject = extractWords(textContent, [...stopWords])
    for (const w of stopWords) {
      expect(subject).not.toHaveProperty(w)
    }
    expect(subject).toMatchSnapshot()
  })

  test('convertRecordToMap', () => {
    // We're removing 'to' as a stop word
    const textHashMap = extractWords(textContent, [...stopWords, 'to'])
    // But 'to' should be present in the top 20 of the words used at least 10 times
    const summarized = summarize(textHashMap, 10, 20)
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
