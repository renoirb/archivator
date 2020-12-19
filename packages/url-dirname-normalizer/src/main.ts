import { searchParams, pathName, toUrl } from './normalizer'

/**
 * dirnameNormalizer — An URL to filesystem path normalizer.
 *
 * @public
 *
 * For any URL, we want a valid filesystem path
 * in which we might want to archive files to.
 *
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/normalizer/slugs.js#L18-L59 | v2.0.0, rework implementation as handleSearchParam}
 *
 * @param url - The URL to convert into a valid path name
 * @param removeAccents - Should we remove any accents before normalizing (default: false)
 */
export const main = (url: string, removeAccents = false): string => {
  let nUrl = url
  if (removeAccents === true) {
    // Remove accents
    nUrl = nUrl.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
  }
  const search = searchParams(nUrl)
  const pathname = pathName(nUrl)
  const urlObj = toUrl(nUrl)
  return String(`${urlObj.hostname}${pathname}${search}`)
    .toLowerCase()
    .replace(/(www\.)/g, '')
}
