import { URL } from '../url'

/**
 * Normalize URL PathName
 *
 * Normalizing from URL http://www.example.org/fOo/Bar/bAAz.html
 * taking "/fOo/Bar/bAAz.html" into "/foo/bar/baaz"
 */
export const pathNameNormalizer = (resourceUrl: URL): string => {
  let out = String(resourceUrl.pathname).toLowerCase()
  out = out.replace(/-[a-z0-9]{5,}$/, '')
  out = out.replace(/%40/, '_at_')
  out = out.replace(/\.(action|fcgi|do)/, '')
  out = out.replace(/\/$/, '')
  out = out.replace(/:/, '/')
  out = out.replace(/\/\//, '/')
  out = out.replace(/[@=%&#()~!,]+/g, '')
  out = out.replace(/\.(s?html?|php|xml|aspx?)/, '')

  return out
}