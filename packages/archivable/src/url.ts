/**
 * In order to avoid importing full libraries.
 * Shim here only what's needed.
 */

import { URL } from 'url'

/**
 * Take a string, make it an URL object
 *
 * Should be the same as [url-dirname-normalizer’s toUrl][url-dirname-normalizer-tourl] at `src/url.ts`
 *
 * TODO: See why transpiling with Bili and Rollup doesn't treeshake away all url-dirname-normalizer but toUrl
 *
 * [url-dirname-normalizer-tourl]: https://github.com/renoirb/archivator/blob/v3.x-dev/packages/url-dirname-normalizer
 */
export const toUrl = (url: string): URL => {
  let out: URL
  try {
    out = new URL(url)
  } catch (err) {
    throw new Error(err)
  }

  return out
}

export { URL }
