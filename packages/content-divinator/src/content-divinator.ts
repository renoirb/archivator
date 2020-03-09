import { words } from './extractors'
import { WordUsageMapType, ContentDivinatorType } from './types'

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
}
