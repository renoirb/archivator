import { sorting } from '../sorting'
import { RecordToMapFactoryType, MapToRecordHashMapFactoryType } from '../types'

/**
 * Convert `Record<string, number>` HashMap to `Map<string, number>`
 *
 * For sorting, refer to {@link sorting.whenRecordValueIsNumberOrderByDescending}
 *
 * @package utils
 *
 * @param textHashMap - Unique "word" where each value is its usage count
 */
export const convertRecordHashMapToMap: RecordToMapFactoryType<
  string,
  number
> = textHashMap => {
  const map = new Map<string, number>(Object.entries(textHashMap))

  const out = new Map<string, number>(
    [...map.entries()].sort(sorting.whenRecordValueIsNumberOrderByDescending),
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
export const convertMapToRecordHashMap: MapToRecordHashMapFactoryType<
  string,
  number
> = textMap => {
  const textHashMap: Record<string, number> = Object.create(null)

  for (let [key, value] of textMap.entries()) {
    Object.assign(textHashMap, { [key]: value })
  }

  return textHashMap
}
