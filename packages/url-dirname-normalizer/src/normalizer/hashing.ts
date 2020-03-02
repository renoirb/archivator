import { URL } from '../url'
import { createHashFunction, CryptoCommonHashingFunctions } from '../hashing'

/**
 * Asset URL asset file name hasher.
 *
 * For any given Rewrite a file name based on an URL they were downloaded from.
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export const assetUrlHasher = (
  resourceUrl: URL,
  hash: CryptoCommonHashingFunctions = 'sha1',
): string => {
  const pathname = resourceUrl.pathname
  // svg, png, jpg, webm
  let extension = ''
  const matches = pathname.match(/(\.[a-z]{2,})$/i)
  if (matches !== null && Array.isArray(matches) && matches[0]) {
    extension = matches[0]
  }

  const hashed = createHashFunction(hash, 'hex')(String(resourceUrl))
  return hashed + extension.toLowerCase()
}
