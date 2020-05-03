import { toUrl } from './url'

/**
 * Given every row in source file .csv
 *
 * ```csv
 * http://example.org/a/b.html;selector;truncate
 * ```
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 *
 * {@link parseArchivableCsvLine}
 * {@link ArchivableOrderedInputUrlTruncateTuplesFirstLine}
 */
export type ArchivableOrderedInputUrlTruncateTuplesType = [
  string,
  string,
  string,
]

/**
 * The first line of the archive index CSV file
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 *
 * {@link parseArchivableCsvLine}
 */
export const ArchivableOrderedInputUrlTruncateTuplesFirstLine =
  '"Web Page URL";"CSS Selectors for main content";"CSS Selectors to strip content off"'

/**
 * An Archivable Entity.
 *
 * For a given source document URL, where to extract the main content ("selector"),
 * and what parts of the page aren't relevant to an archive ("truncate").
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export interface ArchivableType {
  /**
   * Based on the constructor url argument, where on the filesystem to archive the web page
   */
  archive: string | null
  /**
   * CSS selector where the principal web page content is in
   */
  selector: string
  /**
   * Coma Separated List of CSS selectors to strip content off (e.g. ads, orthogonal content)
   */
  truncate: string
  /**
   * URL to the source document
   */
  url: string
}

/**
 * Parse an Archivable CSV Line.
 *
 * ```csv
 * http://example.org/a/b.html;selector;truncate
 * ```
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export const parseArchivableCsvLine = (
  line: string,
): ArchivableOrderedInputUrlTruncateTuplesType => {
  const [url = null, selector = '', truncate = ''] = line.split(';')

  const errorMessage = `parseArchivableCsvLine invalid received line "${line}"`

  try {
    // This should throw at runtime.
    toUrl(url as string)
  } catch (e) {
    const message = `${errorMessage}. ${e}`
    throw new Error(message)
  }

  if (typeof url === 'string') {
    return [url, selector, truncate]
  } else {
    throw new Error(errorMessage)
  }
}

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

export class Archivable implements ArchivableType {
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

  toJSON(): Readonly<ArchivableType> {
    const out: ArchivableType = {
      archive: this.archive,
      selector: this.selector,
      truncate: this.truncate,
      url: this.url,
    }

    return Object.seal<ArchivableType>(out)
  }

  static fromJSON(arg): ArchivableType {
    const argIsString = typeof arg === 'string'
    if (argIsString === false) {
      const message = 'Only String is supported'
      throw new Error(message)
    }
    const { url = null, truncate = '', selector = '' } = JSON.parse(arg)

    return new Archivable(url, truncate, selector)
  }

  /**
   * {@link parseArchivableCsvLine}
   */
  static fromLine(line = 'http://localhost;;'): Archivable {
    const [url, selector, truncate] = parseArchivableCsvLine(line) as string[]
    return new Archivable(url, selector, truncate)
  }
}
