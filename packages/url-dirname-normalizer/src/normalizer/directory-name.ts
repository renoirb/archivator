import { searchParamsNormalizer, pathNameNormalizer } from '.'
import { toUrl, URL } from '../url'

/**
 * An URL to filesystem path normalizer.
 *
 * For any URL, we want a valid filesystem path
 * in which we might want to archive files to.
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export const directoryNameNormalizer = (url: string): string => {
  const urlObj: URL = toUrl(url)
  const search = searchParamsNormalizer(urlObj)
  const pathname = pathNameNormalizer(urlObj)
  return String(`${urlObj.hostname}${pathname}${search}`)
    .toLowerCase()
    .replace(/(www\.)/g, '')
}
