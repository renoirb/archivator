import { words } from './extractors'
import { WordUsageMapType } from './types'

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
}
