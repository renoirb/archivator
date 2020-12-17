import { words } from './extractors'
import { _createContentDivinatorSetup } from './factories'
import type { WordUsageMapType, AvailableStopWordResources } from './types'

/**
 * Attempt at guessing stuff, summarize content, based on raw text.
 *
 * This is the entry-point to other utilities.
 * Instance of this class should contain contextual configuration such
 * as the stop-words, and locales.
 *
 * Methods should return immutable copies of the instance’s configuration.
 *
 * @public
 */
export class ContentDivinator {
  private readonly _stopWords: ReadonlyArray<string>
  private readonly _locales: ReadonlyArray<string>

  /**
   * Create a ContentDivinator instance.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase String.prototype.toLocaleLowerCase}
   *
   * @param stopWords - Words that should be ignored
   * @param locales - Locales tags to support for toLocaleLowercase
   */
  constructor(
    stopWords: string[] = [],
    locales: string[] = ['en-CA', 'fr-CA'],
  ) {
    this._stopWords = Object.freeze(stopWords)
    this._locales = Object.freeze(locales)
  }

  /**
   * Extract words from the following text.
   *
   * If special symbols are found, they will be stripped off.
   *
   * @param body - Contents to process, only text.
   */
  words(text: string): WordUsageMapType {
    const stopWords = [...this._stopWords]
    const locales = [...this._locales]
    return words(text, stopWords, locales)
  }

  /**
   * Create a preconfigured ContentDivinator based on statically stored files.
   *
   * @param predefined - Load a locally available stop-word library, refer to `AvailableStopWordResources` (e.g. 'english')
   * @param locales - Add more locale tags, if needed
   */
  static factory(
    predefined: AvailableStopWordResources,
    locales: string[] = [],
  ): ContentDivinator {
    const { locales: moarLocales, stopWords } = _createContentDivinatorSetup(
      predefined,
      locales,
    )

    return new ContentDivinator(stopWords, moarLocales)
  }
}
