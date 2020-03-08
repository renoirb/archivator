/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { TextProcessingNormalizer, convertRecordHashMapToMap, summarize } from '..'

import { fixtures } from '.'

describe('TextProcessingNormalizer', () => {
  test('Happy-Path', () => {
    const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
      'english-stop-words-alpha.json',
    )
    const subject = new TextProcessingNormalizer([...stopWords])
    expect(subject).toMatchSnapshot()
    const textContent = fixtures.loadText('article-alpha.txt')
    const textHashMap = subject.extractWords(textContent)
    expect(textHashMap).toMatchSnapshot()
    const textMap = convertRecordHashMapToMap(textHashMap)
    expect(textMap).toMatchSnapshot()
    for (const w of stopWords) {
      expect(textHashMap).not.toHaveProperty(w)
      expect(textMap.has(w)).toBe(false)
    }
  })

  test('Sanity-Check', () => {
    /**
     * Let's attempt to textHashMap that looks like this:
     *
     * ```js
     * const textHashMap = {
     *   chuck: 5,
     *   wood: 4,
     *   woodchuck: 4,
     * }
     * ```
     *
     * So we could be able to guess what's the main topic.
     */
    const textContent = `
      How much wood would a woodchuck chuck
      if a woodchuck could chuck wood?
      He would chuck, he would, as much as he could,
      and chuck as much wood as a woodchuck would
      if a woodchuck could chuck wood.
    `
    // Let's remove a few words for simplicity.
    const stopWords = ['a', 'as', 'could', 'he', 'how', 'if', 'much', 'would']
    const subject = new TextProcessingNormalizer(stopWords)
    const textHashMap = subject.extractWords(textContent)
    expect(textHashMap).toMatchSnapshot()
    const summarized = summarize(textHashMap, 3)
    expect(summarized).toMatchSnapshot()
  })
})
