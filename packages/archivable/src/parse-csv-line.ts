import { toUrl } from 'url-dirname-normalizer'

import type { ArchivableOrderedInputUrlTruncateTuplesType } from './types'

/**
 * Parse an Archivable CSV Line.
 *
 * Private method to handle parsing
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
    const out: ArchivableOrderedInputUrlTruncateTuplesType = [
      url,
      selector,
      truncate,
    ]
    return out
  } else {
    throw new Error(errorMessage)
  }
}
