import { SummaryRecordType, WordUsageMapType } from '../types'

/**
 * Summarizing content.
 *
 * For starters, what are the most used "keywords".
 * More things to come.
 *
 * ----
 *
 * See earlier implementation:
 *   v2.0.0, rework implementation:
 *     links:
 *       - name: sortedAndKeywords
 *         replacing: analyze
 *         replacedWith: summary
 *         url: https://github.com/renoirb/archivator/blob/v2.0.0/src/analyze.js#L50-L62
 *
 * ----
 *
 * @param {Map<string, number>} wordsMap — Unique "word" where each value is its usage count
 * @param {number} [floor=3] — In keywords grouping, what is the minimum number of times to qualify
 * @param {number} [max=10] — In keywords grouping, how many items in the top keywords
 */
export const summary = (
  wordsMap: WordUsageMapType,
  floor: number = 3,
  max: number = 10,
): SummaryRecordType => {
  const zeroIndexSafeFloor = Number.isInteger(+floor) && +floor > 0 ? floor : 1
  const keywords: string[] = []
  let iter = 0
  // @ts-ignore
  for (const [word, count] of wordsMap.entries()) {
    if (iter < max && count > zeroIndexSafeFloor) {
      keywords.push(word)
    }
    iter++
  }

  const out: SummaryRecordType = { keywords }

  return out
}
