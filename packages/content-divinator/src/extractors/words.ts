import {
  wordNormalizer,
  nonStopWordIsser,
  convertRecordHashMapToMap,
} from '../utils'
import type { WordUsageMapType } from '../types'

/**
 * Extract words and calculate usage frequency.
 *
 * @internal
 * @package extractors
 *
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L22-L46 replacing v1.0 implementation of extractWords}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L76-L94 replacing v1.0 implementation of analyze}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L63-L74 replacing v1.0 implementation of sort}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L18-L20 replacing v1.0 implementation of removePunctuation}
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L13-L16 replacing v2.0 implementation of normalize as wordNormalizer}
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L18-L48 replacing v2.0 implementation of extractWords as words}
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L64-L77 replacing v2.0 implementation of sort}
 *
 * @param body - Text content, as a single string
 * @param stopWords - Words that should be ignored
 * @param locales - Locales tags to support for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase|String.prototype.toLocaleLowerCase} (default: `['en-ca']`)
 */
export const words = (
  body: string,
  stopWords: string[] = [],
  locales: string | string[] = ['en-CA'],
): WordUsageMapType => {
  const normalizeWord = wordNormalizer(locales)
  const isNonStopWord = nonStopWordIsser(stopWords)
  // We want to use Object.create(null) instead of Map
  // because we want to quickly increment values on an Hash-Map
  const words: Record<string, number> = Object.create(null)
  const foundOnce = new Set<string>()
  const text = body.split(' ')
  for (let i = 0; i < text.length; i++) {
    const word = normalizeWord(text[i])
    if (word && isNonStopWord(word)) {
      if (foundOnce.has(word)) {
        // This was the former way to check, before we had Map.
        // Leaving here for old memories’ sake.
        if (Object.prototype.hasOwnProperty.call(words, word)) {
          words[word]++
        } else {
          words[word] = 2
        }
      } else {
        foundOnce.add(word)
      }
    }
  }

  const sorted = convertRecordHashMapToMap(words)

  return Object.seal(sorted)
}
