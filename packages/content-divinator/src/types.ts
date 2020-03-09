/**
 * Word Usage Count.
 *
 * First item is the word, second item is its count.
 *
 * @public
 */
export type WordUsageMapType = Map<string, number>

/**
 * All words found on a document, one word per item.
 * May or may not have duplicates.
 *
 * @public
 */
export type WordsType = ReadonlyArray<string>

/**
 * Function Signature for checking if a word is a non-stop-word.
 *
 * @internal
 */
export type NonStopWordIsserType = (word: string) => boolean

/**
 * Function Signature for the
 *
 * @internal
 */
export type WordNormalizerType = (word: any) => string | void

/**
 * What are the sorted words and the top keywords found after analysis.
 *
 * @public
 */
export interface SummaryRecordType {
  keywords: string[]
}

/**
 * Convert `Record<T, U>` into `Map<T, U>` utility.
 *
 * When we want to convert a Record hash-map into an ECMAScript2015 Map.
 *
 * @public
 */
export type RecordToMapFactoryType<T = string | number, U = string | number> = (
  input: Record<T, U>,
) => Map<T, U>

/**
 * Convert `Map<T, U>` to `Record<T, U>` utility.
 *
 * When we want to convert an ECMAScript2015 Map into a Record hash-map.
 *
 * @public
 */
export type MapToRecordHashMapFactoryType<
  T = string | number,
  U = string | number
> = (input: Map<T, U>) => Record<T, U>
