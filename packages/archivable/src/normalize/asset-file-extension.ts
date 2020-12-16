import { toUrl } from 'url-dirname-normalizer'
import type { INormalizedAssetFileExtensionExtractorFn } from '../types'

/**
 * Return a file extension with a dot as prefix, or an empty string.
 *
 * @package
 *
 * One can set their own normalizer, as long as it of type `(file: string) => string`
 * When the output is either an empty string, or a file extension prefixed by a dot (e.g. `.png`)
 */
export const assetFileExtensionNormalizer: INormalizedAssetFileExtensionExtractorFn = (
  assetUrl,
) => {
  const url = toUrl(assetUrl)
  // svg, png, jpg, webm
  let extension = ''
  const matches = url.pathname.match(/(\.[a-z]{2,})$/i)
  if (matches !== null && Array.isArray(matches) && matches[0]) {
    if (matches[0] !== '') {
      extension = matches[0]
    }
  }

  return extension.toLowerCase()
}
