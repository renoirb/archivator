import { extractWords } from './extract-words'

export class TextProcessingNormalizer {
  private readonly stopWords: ReadonlyArray<string>
  private readonly locales: ReadonlyArray<string>

  textHashMap?: Readonly<Record<string, number>>
  text?: string

  constructor(
    stopWords: string[] = [],
    locales: string[] = ['en-CA', 'fr-CA'],
  ) {
    this.stopWords = Object.freeze(stopWords)
    this.locales = Object.freeze(locales)
  }

  setText(text: string): void {
    if (this.text) {
      const message = `Cannot re-use the same object, please create a fresh instance`
      throw new Error(message)
    }
    Object.defineProperty(this, 'text', {
      value: text,
      writable: false,
      configurable: false,
    })
    const stopWords = [...this.stopWords]
    const locales = [...this.locales]
    this.textHashMap = Object.seal(extractWords(text, stopWords, locales))
  }
}
