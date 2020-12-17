import { toUrl } from './url'

/**
 * Normalize URL Search Params into a path representing them.
 *
 * Get path '/bar/bazz/zulu/please' as consistently sorted
 * out of free-form 'http://example.org/foo?zulu=please&bar=bazz&buzz'
 *
 * First, we pick only 'zulu=please&bar=bazz&buzz',
 * sort it consistently.
 */
export const searchParams = (url: string): string => {
  const urlObj = toUrl(url)
  // Explode at &, and sort search params order for consistent results
  // Notice input order is b,a,c and is sorted to be a,b,c
  // ?b=2&a=1&c=  -> [a=1, b=2, c=]
  // ?a=1&c=&b=2  -> [a=1, b=2, c=]
  let search = String(urlObj.search).replace(/^\?/, '').split('&').sort()
  search = search
    .map((t) => t.toLowerCase())
    .sort((a, b) => {
      const left = a.split('=')[0]
      const right = b.split('=')[0]
      const out = left < right ? -1 : 1
      return out
    })
  // Filter out empty elements
  // ?b=2&a=1&c=  -> [a=1, b=2]
  // ?b=2&a=1&c   -> [a=1, b=2]
  let pairs = search.map((e) => e.split('='))
  // @ts-ignore
  pairs = pairs.filter((e) => Boolean(e[1]))
  const flattened = pairs.map((e) => e.join('/'))
  const out = String('/' + flattened.join('/'))
    .toLowerCase()
    .replace(/pageI?d?/i, 'page')
  return /^\/$/.test(out) ? '' : out
}
