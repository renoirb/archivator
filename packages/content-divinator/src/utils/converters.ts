import { whenRecordValueIsNumberOrderByDescending } from '../sorting'

/**
 * Convert `Record<string, number>` HashMap to `Map<string, number>`
 *
 * For sorting, refer to {@link whenRecordValueIsNumberOrderByDescending}
 *
 * @package utils
 *
 * @param textHashMap - Unique "word" where each value is its usage count
 */
export const convertRecordHashMapToMap = (
  textHashMap: Record<string, number>,
): Map<string, number> => {
  const map = new Map<string, number>(Object.entries(textHashMap))

  const out = new Map<string, number>(
    [...map.entries()].sort(whenRecordValueIsNumberOrderByDescending),
  )

  return out
}

/**
 * Convert `Map<string, number>` to `Record<string, number>` HashMap
 *
 * @public
 * @package utils
 *
 * @param textHashMap - Unique "word" where each value is its usage count
 */
export const convertMapToRecordHashMap = (
  textMap: Map<string, number>,
): Record<string, number> => {
  const out: Record<string, number> = Object.create(null)

  for (const [key, value] of textMap.entries()) {
    Object.assign(out, { [key]: value })
  }

  return out
}
