import { toUrl } from 'url-dirname-normalizer'

import { parseArchivableCsvLine } from './parse-csv-line'
import { appendSelector, appendTruncate } from './macros'

import type {
  IArchivableOrderedInputUrlTruncateTuple,
  IArchivable,
} from './types'

/**
 * The first line of the archive index CSV file.
 *
 * @public
 * {@inheritDoc IArchivableOrderedInputUrlTruncateTuple}
 */
export const ArchivableOrderedInputUrlTruncateTuplesFirstLine =
  '"Web Page URL";"CSS Selectors for main content";"CSS Selectors to strip content off"'

/**
 * Something to Archive.
 *
 * From an URL, which part to pick from that page,
 * what to truncate.
 *
 * @public
 */
export class Archivable implements IArchivable {
  readonly archive: string | null = null
  readonly selector: string
  readonly truncate: string
  readonly url: string

  /**
   * @param url - URL to the source document
   * @param selector - CSS selector where the principal web page content is in
   * @param truncate - Coma Separated List of CSS selectors to strip content off (e.g. ads, orthogonal content)
   */
  constructor(url: string, selector = '', truncate = '') {
    // At runtime, do not let undefined pass.
    if (typeof url === 'undefined') {
      const message = `First argument is URL, and is Required`
      throw new Error(message)
    }

    // Nor invalid URLs.
    try {
      // toUrl should throw
      const sourceDocument = toUrl(url)
      this.selector = appendSelector(selector)
      this.truncate = appendTruncate(truncate)
      this.url = String(sourceDocument)
    } catch (e) {
      throw new Error(e)
    }
  }

  toJSON(): Readonly<IArchivable> {
    const out: IArchivable = {
      archive: this.archive,
      selector: this.selector,
      truncate: this.truncate,
      url: this.url,
    }

    return Object.seal<IArchivable>(out)
  }

  static fromTuple(tuple: IArchivableOrderedInputUrlTruncateTuple): Archivable {
    const [url, selector, truncate] = tuple
    return new Archivable(url, selector, truncate)
  }

  toTuple(): Readonly<IArchivableOrderedInputUrlTruncateTuple> {
    const { url, selector, truncate } = this.toJSON()
    return Object.freeze<IArchivableOrderedInputUrlTruncateTuple>([
      url,
      selector,
      truncate,
    ])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Convert a JSON string into an IArchivable object.
   *
   * @param maybeValidString - Take a JSON String, hopefully in the format for IArchivable
   */
  static fromJSON(maybeValidString: string): Archivable {
    const argIsString = typeof maybeValidString === 'string'
    if (argIsString === false) {
      const message = 'Only String is supported'
      throw new Error(message)
    }
    const { url = null, truncate = '', selector = '' } = JSON.parse(
      maybeValidString,
    )

    return new Archivable(url, truncate, selector)
  }

  /**
   * Take a string, creates an Archivable based on it.
   *
   * @param line - string of text that may or may not be valid CSV
   */
  static fromLine(
    line = 'http://localhost;body;.ad,.social-button',
  ): Archivable {
    const [url, selector, truncate] = parseArchivableCsvLine(line)
    return new Archivable(url, selector, truncate)
  }

  /**
   * Extract from CSV line.
   *
   * @param line - string of text that may or may not be valid CSV
   */
  static parseLine(
    line = 'http://localhost;body;.ad,.social-button',
  ): IArchivableOrderedInputUrlTruncateTuple {
    const tuple = parseArchivableCsvLine(line)
    return tuple
  }
}
