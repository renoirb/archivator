/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { TextProcessingNormalizer } from '../text-processing-normalizer'

import { fixtures } from '.'

describe('TextProcessingNormalizer', () => {
  test('Happy-Path', () => {
    const stopWords = fixtures.loadJson<ReadonlyArray<string>>(
      'english-stop-words-alpha.json',
    )
    const subject = new TextProcessingNormalizer([...stopWords])
    const textContent = fixtures.loadText('article-alpha.txt')
    subject.setText(textContent)
    expect(subject).toMatchSnapshot()
    const { textHashMap } = subject
    for (const w of stopWords) {
      expect(textHashMap).not.toHaveProperty(w)
    }
  })
})
