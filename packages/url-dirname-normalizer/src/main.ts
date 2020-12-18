import { searchParams, pathName, toUrl } from './normalizer'

/**
 * An URL to filesystem path normalizer.
 *
 * @public
 *
 * For any URL, we want a valid filesystem path
 * in which we might want to archive files to.
 *
 * {@link https://github.com/renoirb/archivator/blob/v2.0.0/src/normalizer/slugs.js#L18-L59 v2.0.0, rework implementation as handleSearchParam}
 */
export const main = (url: string): string => {
  const search = searchParams(url)
  const pathname = pathName(url)
  const urlObj = toUrl(url)
  return String(`${urlObj.hostname}${pathname}${search}`)
    .toLowerCase()
    .replace(/(www\.)/g, '')
}
