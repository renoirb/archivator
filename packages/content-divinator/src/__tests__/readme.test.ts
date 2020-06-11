/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { ContentDivinator } from '..'
import { summary } from '../extractors'
import { convertMapToRecordHashMap } from '../utils'

describe('README.md examples', () => {
  test('ContentDivinator', () => {
    /**
     * Let's attempt to wordsMap that looks like this:
     *
     * The following is a `Record<string, number>` representation of `Map<string, number>`.
     *
     * Refer to {@link convertMapToRecordHashMap|convertMapToRecordHashMap} for conversion algorithm.
     *
     * So we could be able to guess what's the main topic.
     */
    const desiredTextHashMap = {
      chuck: 5,
      wood: 4,
      woodchuck: 4,
    }
    const textContent = `
      How much wood would a woodchuck chuck
      if a woodchuck could chuck wood?
      He would chuck, he would, as much as he could,
      and chuck as much wood as a woodchuck would
      if a woodchuck could chuck wood.
    `
    // Let’s remove a few words for simplicity.
    const stopWords = ['a', 'as', 'could', 'he', 'how', 'if', 'much', 'would']
    const subject = new ContentDivinator(stopWords)
    const wordsMap = subject.words(textContent)
    expect(wordsMap).toMatchSnapshot()
    const summarized = summary(wordsMap, 3)
    expect(summarized).toMatchSnapshot()
    expect(wordsMap.get('chuck')).toBe(5)
    expect(wordsMap.get('wood')).toBe(4)
    expect(wordsMap.get('woodchuck')).toBe(4)
    const textHashMap = convertMapToRecordHashMap(wordsMap)
    expect(textHashMap).toMatchSnapshot()
    expect(textHashMap).toMatchObject(desiredTextHashMap)
  })
})
