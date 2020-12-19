import type { WordNormalizerType, NonStopWordIsserType } from '../types'

/**
 * Remove any non alpha numeric items.
 *
 * @public
 * @package utils
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase MDN documentation for String.toLocaleLowerCase method}
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L13-L16 replacing earlier v2.0 implementation of normalize}
 */
export const wordNormalizer = (
  locales?: string | string[],
): WordNormalizerType => (word) =>
  word && typeof word === 'string'
    ? word.replace(/[^\w]/g, '').toLocaleLowerCase(locales)
    : undefined

/**
 * Utility method to shave off words with no meaning.
 *
 * @public
 * @package utils
 */
export const nonStopWordIsser = (
  stopWords: string[] = [],
): NonStopWordIsserType => {
  // https://www.ranks.nl/stopwords
  // http://xpo6.com/list-of-english-stop-words/
  const stopWordsSet = new Set([...stopWords])

  return (word) => stopWordsSet.has(word) === false
}
