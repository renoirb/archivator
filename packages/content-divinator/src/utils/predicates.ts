import { WordNormalizerType, NonStopWordIsserType } from '../types'

/**
 * Remove any non alpha numeric items.
 *
 * @package utils
 *
 * ----
 *
 * Bookmarks:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase
 *
 * See:
 * - https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L13-L16
 */
export const wordNormalizer = (
  locales?: string | string[],
): WordNormalizerType => word =>
  word && typeof word === 'string'
    ? word.replace(/[^\w]/g, '').toLocaleLowerCase(locales)
    : void 0

/**
 * Utility method to shave off words with no meaning.
 *
 * @public
 * @package utils
 */
export const nonStopWordIsser = (
  stopWords: string[] = [],
): NonStopWordIsserType => {
  /**
   * https://www.ranks.nl/stopwords
   * http://xpo6.com/list-of-english-stop-words/
   */
  const stopWordsSet = new Set([...stopWords])

  return word => stopWordsSet.has(word) === false
}
