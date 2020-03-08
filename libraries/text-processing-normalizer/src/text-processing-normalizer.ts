import { extractWords } from './extract-words'

export class TextProcessingNormalizer {
  private readonly stopWords: ReadonlyArray<string>
  private readonly locales: ReadonlyArray<string>

  constructor(
    stopWords: string[] = [],
    locales: string[] = ['en-CA', 'fr-CA'],
  ) {
    this.stopWords = Object.freeze(stopWords)
    this.locales = Object.freeze(locales)
  }

  extractWords(text: string): Record<string, number> {
    const stopWords = [...this.stopWords]
    const locales = [...this.locales]
    return extractWords(text, stopWords, locales)
  }
}
