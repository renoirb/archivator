import { wordNormalizer, nonStopWordIsser } from './predicates'
import { SortedKeywordsRecordType, RecordToMapFactoryType } from './types'
import { sorting } from './utils'

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
 *         replacing: extractWords
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L18-L48
 *       - name: sortedAndKeywords
 *         replacing: analyze
 *         replacedWith: summarize
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L50-L62
 *       - name: sort
 *         replacing: sort
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L64-L77
 */

/**
 * Extract words
 * @param {string} body — Text content, as a single string
 * @param {string[]} [stopWords] — Words that should be ignored
 * @param {string[]} [locales] — Locales tags to support for {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase|String.prototype.toLocaleLowerCase}
 */
export const extractWords = (
  body: string,
  stopWords: string[] = [],
  locales: string | string[] = ['en-CA'],
): Record<string, number> => {
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
  return Object.seal(words)
}

/**
 * Take a collection of words,
 * Return the same collection, sorted by usage.
 *
 * @param {Object.<string, number>} textHashMap — Unique "word" where each value is its usage count
 */
export const extractWordsSorter: RecordToMapFactoryType<
  string,
  number
> = textHashMap => {
  const map = new Map<string, number>(Object.entries(textHashMap))
  const out = new Map<string, number>(
    [...map.entries()].sort(sorting.whenValuesAreNumbersFromBiggestToLowest),
  )

  return out
}

/**
 * @param {Object.<string, number>} textHashMap — Unique "word" where each value is its usage count
 * @param {number} [floor=3] — In keywords grouping, what is the minimum number of times to qualify
 * @param {number} [max=10] — In keywords grouping, how many items in the top keywords
 */
export const summarize = (
  textHashMap: Record<string, number>,
  floor: number = 3,
  max: number = 10,
): SortedKeywordsRecordType => {
  const zeroIndexSafeFloor = Number.isInteger(+floor) && +floor > 0 ? floor : 1
  // const zeroIndexSafeMax = Number.isInteger(+max) && +max > 0 ? max : 1
  const keywords: string[] = []
  const sorted = extractWordsSorter(textHashMap)
  let iter = 0
  // @ts-ignore
  for (const [word, count] of sorted.entries()) {
    if (iter < max && count > zeroIndexSafeFloor) {
      keywords.push(word)
    }
    iter++
  }

  const out: SortedKeywordsRecordType = { sorted, keywords }

  return out
}
