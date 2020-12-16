import { toUrl } from 'url-dirname-normalizer'

import type { IArchivableOrderedInputUrlTruncateTuple } from './types'

/**
 * Parse an Archivable CSV Line.
 *
 * @public
 */
export const parseArchivableCsvLine = (
  line: string,
): IArchivableOrderedInputUrlTruncateTuple => {
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
    const out: IArchivableOrderedInputUrlTruncateTuple = [
      url,
      selector,
      truncate,
    ]
    return out
  } else {
    throw new Error(errorMessage)
  }
}
