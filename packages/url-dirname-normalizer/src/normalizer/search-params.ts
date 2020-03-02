import { URL } from '../url'

/**
 * Normalize URL Search Params — (e.g. bar&baz=buzz in http://example.org?bar&bazz=buzz)
 *
 * The following could be one multi-line.
 * But it's easier to debug like that if we need
 * to review the pass rules.
 */
export const searchParamsNormalizer = (url: URL): string => {
  // Explode at &, and sort search params order for consistent results
  // ?b=2&a=1&c=  -> [a=1, b=2, c=]
  // ?a=1&c=&b=2  -> [a=1, b=2, c=]
  const search = String(url.search)
    .replace(/^\?/, '')
    .split('&')
    .sort()
  // Filter out empty elements
  // ?b=2&a=1&c=  -> [a=1, b=2]
  // ?b=2&a=1&c   -> [a=1, b=2]
  let pairs = search.map(e => e.split('='))
  pairs = pairs.filter(e => Boolean(e[1]))
  const flattened = pairs.map(e => e.join('/'))
  const out = String('/' + flattened.join('/')).replace(/pageI?d?/i, 'page')
  return /^\/$/.test(out) ? '' : out
}
