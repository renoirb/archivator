import { wordNormalizer, nonStopWordIsser } from './predicates'

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
 *       - name: analyze
 *         replacing: analyze
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L50-L62
 *       - name: sort
 *         replacing: sort
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L64-L77
 */

export const extractWords = (
  body: string,
  stopWords: string[] = [],
  locales: string | string[] = ['en-CA', 'fr-CA'],
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

// /**
//  * Take a collection of words,
//  * Return the same collection, sorted by usage.
//  *
//  * @param subject
//  */
// export function sort(subject) {
//   let sortable = []
//   for (let key in subject) {
//     sortable.push([key, subject[key]])
//   }
//   // Sort from more occurences, to least
//   sortable.sort((a, b) => {
//     return -1 * (a[1] - b[1])
//   })
//
//   return sortable // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
// }
//
// export const analyze = (words) => {
//   const keywords = new Map<string, number>()
//   const sorted = sort(words)
//   const max = 10
//   let iter = 0
//   for (let popular of sorted) {
//     let used = popular[1] // word has been used n times
//     let word = popular[0]
//     if (iter <= max && used > 3) {
//       keywords.set(word, used)
//     }
//     iter++
//   }
//
//   recv.data.keywords = keywords
//
//   return recv
// }
