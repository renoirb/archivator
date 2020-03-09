import { words } from './extractors'
import { WordUsageMapType, AvailableStopWordResources } from './types'
import { _createContentDivinatorSetup } from './factories'

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
  private readonly stopWords: ReadonlyArray<string>
  private readonly locales: ReadonlyArray<string>

  /**
   * Create a ContentDivinator instance.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase|String.prototype.toLocaleLowerCase}
   *
   * @param stopWords - Words that should be ignored
   * @param locales - Locales tags to support for toLocaleLowercase
   */
  constructor(
    stopWords: string[] = [],
    locales: string[] = ['en-CA', 'fr-CA'],
  ) {
    this.stopWords = Object.freeze(stopWords)
    this.locales = Object.freeze(locales)
  }

  /**
   * Extract words from the following text.
   *
   * If special symbols are found, they will be stripped off.
   *
   * @param body - Contents to process, only text.
   */
  words(text: string): WordUsageMapType {
    const stopWords = [...this.stopWords]
    const locales = [...this.locales]
    return words(text, stopWords, locales)
  }

  /**
   * Create a preconfigured ContentDivinator based on statically stored files.
   *
   * @param predefined - Load a locally available stop-word library, refer to {@link AvailableStopWordResources}
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
