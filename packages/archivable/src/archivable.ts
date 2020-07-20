import { toUrl } from 'url-dirname-normalizer'

import { parseArchivableCsvLine } from './parse-csv-line'

import type {
  ArchivableOrderedInputUrlTruncateTuplesType,
  IArchivable,
} from './types'

const appendTruncate = (truncateArg: string): string => {
  // Truncate is to strip off any patterns we do not want
  // as part of our archived article.
  let truncate = truncateArg.length === 0 ? '' : `${truncateArg},`
  truncate += 'script,style,noscript,template'
  return truncate
}

const appendSelector = (selectorArg: string): string => {
  // If we know exactly where the main content is, otherwise grab the whole
  // document body.
  return selectorArg.length === 0 ? 'body' : `${selectorArg}`
}

/**
 * Something to Archive.
 *
 * From an URL, which part to pick from that page,
 * what to truncate.
 */
export class Archivable implements IArchivable {
  readonly archive: string | null = null
  readonly selector: string
  readonly truncate: string
  readonly url: string

  /**
   * @param url {string} — URL to the source document
   * @param selector {string} — CSS selector where the principal web page content is in
   * @param truncate {string} — Coma Separated List of CSS selectors to strip content off (e.g. ads, orthogonal content)
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

  static fromTuple(
    tuple: ArchivableOrderedInputUrlTruncateTuplesType,
  ): Archivable {
    const [url, selector, truncate] = tuple
    return new Archivable(url, selector, truncate)
  }

  toTuple(): Readonly<ArchivableOrderedInputUrlTruncateTuplesType> {
    const { url, selector, truncate } = this.toJSON()
    return Object.freeze<ArchivableOrderedInputUrlTruncateTuplesType>([
      url,
      selector,
      truncate,
    ])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(arg: any): IArchivable {
    const argIsString = typeof arg === 'string'
    if (argIsString === false) {
      const message = 'Only String is supported'
      throw new Error(message)
    }
    const { url = null, truncate = '', selector = '' } = JSON.parse(arg)

    return new Archivable(url, truncate, selector)
  }

  /**
   * Take a string, creates an Archivable based on it.
   *
   * {@link parseArchivableCsvLine}
   *
   * @param {string} line — string of text that may or may not be valid CSV
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
   * {@link parseArchivableCsvLine}
   *
   * @param {string} line — string of text that may or may not be valid CSV
   */
  static parseLine(
    line = 'http://localhost;body;.ad,.social-button',
  ): ArchivableOrderedInputUrlTruncateTuplesType {
    const tuple = parseArchivableCsvLine(line)
    return tuple
  }
}
