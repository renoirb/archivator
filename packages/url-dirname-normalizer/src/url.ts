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
