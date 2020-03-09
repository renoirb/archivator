import { words } from './extractors'
import {
  WordUsageMapType,
  ContentDivinatorType,
  AvailableStopWordResources,
} from './types'
import { createContentDivinatorSetup } from './factories'

/**
 * {@link ContentDivinatorType}
 */
export class ContentDivinator implements ContentDivinatorType {
  private readonly stopWords: ReadonlyArray<string>
  private readonly locales: ReadonlyArray<string>

  constructor(
    stopWords: string[] = [],
    locales: string[] = ['en-CA', 'fr-CA'],
  ) {
    this.stopWords = Object.freeze(stopWords)
    this.locales = Object.freeze(locales)
  }

  words(text: string): WordUsageMapType {
    const stopWords = [...this.stopWords]
    const locales = [...this.locales]
    return words(text, stopWords, locales)
  }

  /**
   * Create a preconfigured ContentDivinator based on statically stored files.
   *
   * @param {string} predefined — Load a locally available stop-word library, refer to {@link AvailableStopWordResources}
   * @param {string[]} moarLocales — Add more locale tags, if needed
   */
  static factory(
    predefined: AvailableStopWordResources,
    moarLocales: string[] = [],
  ): ContentDivinatorType {
    const { locales, stopWords } = createContentDivinatorSetup(
      predefined,
      moarLocales,
    )

    return new ContentDivinator(stopWords, locales)
  }
}
