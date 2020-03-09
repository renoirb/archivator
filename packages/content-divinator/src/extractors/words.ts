import {
  wordNormalizer,
  nonStopWordIsser,
  convertRecordHashMapToMap,
} from '../utils'
import { WordUsageMapType } from '../types'

/**
 * Extract words and calculate usage frequency.
 *
 * ----
 *
 * See earlier implementation:
 *   v1.0.0, initial implementation:
 *     links:
 *       - name: extractWords
 *         url: https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L22-L46
 *       - name: analyze
 *         url: https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L76-L94
 *       - name: sort
 *         url: https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L63-L74
 *       - name: removePunctuation
 *         url: https://github.com/renoirb/archivator/blob/v1.0.0/src/analyze.js#L18-L20
 *   v2.0.0, rework implementation:
 *     links:
 *       - name: normalize
 *         replacing: removePunctuation
 *         replacedWith: wordNormalizer
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L13-L16
 *       - name: extractWords:
 *         replacedWith: words
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L18-L48
 *       - name: sort
 *         replacing: sort
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L64-L77
 *
 * ----
 *
 * @package extractors
 *
 * @param {string} body — Text content, as a single string
 * @param {string[]} [stopWords] — Words that should be ignored
 * @param {string[]} [locales] — Locales tags to support for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase|String.prototype.toLocaleLowerCase}
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
