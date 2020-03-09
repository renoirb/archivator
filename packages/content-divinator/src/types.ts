/**
 * Word Usage Count.
 *
 * First item is the word, second item is its count.
 *
 * @public
 */
export type WordUsageMapType = Map<string, number>

/**
 * Which Stop-Words collection are locally available in the project's
 * resources/stop-words folder.
 *
 * @public
 */
export type AvailableStopWordResources = 'english'

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
 * @public
 *
 * @param word - Is this word not a stop word?
 */
export type NonStopWordIsserType = (word: string) => boolean

/**
 * Function Signature for the
 *
 * @public
 *
 * @param word - lowercased version of a Word.
 */
export type WordNormalizerType = (word: any) => string | void

/**
 * Instantiation configuration helper
 *
 * @internal
 */
export interface ContentDivinatorSetupFactoryType {
  /**
   *  Stop-Words are words that carry no meaning in the context of
   * trying to figure out a web page's textual content.
   *
   * Typical "filler words" in english would be: a,if,He.
   * They're different for each language.
   */
  stopWords: string[]
  /**
   * A list of Language-country tags.
   * They’re useful for helping consistently lowercasing text.
   *
   * Refer to
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Locale|MDN Locale}
   * to learn more about valid locale tags.
   *
   * It will, among other use-cases, be used with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase|String.prototype.toLocaleLowerCase}.
   */
  locales: string[]
}

/**
 * What are the sorted words and the top keywords found after analysis.
 *
 * @public
 */
export interface SummaryRecordType {
  /**
   * After being processed by the {@link extractors.summary|Summary Extractor},
   * what are the top most used words.
   */
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
