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
 * @internal
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
export interface IContentDivinatorSetupFactoryType {
  /**
   *  Stop-Words are words that carry no meaning in the context of
   * trying to figure out a web page's textual content.
   *
   * Typical "filler words" in english would be: a,if,He.
   * They're different for each language.
   */
  readonly stopWords: string[]
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
  readonly locales: string[]
}

/**
 * What are the sorted words and the top keywords found after analysis.
 *
 * @public
 */
export interface ISummaryRecordType {
  /**
   * After being processed by the summary extractor,
   * what are the top most used words.
   */
  readonly keywords: string[]
}
