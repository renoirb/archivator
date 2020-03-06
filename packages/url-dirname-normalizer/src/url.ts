/**
 * URL Manipulation
 *
 * See also:
 * - https://gist.github.com/OliverJAsh/1eae40a87297c05d45f8bff14f7d8729
 */

import { URL } from 'url'

export { URL }

/**
 * Take a string, make it an URL object
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
