import dirnameNormalizer from './main'
import { pathName, searchParams, toUrl } from './normalizer'

/**
 * Normalizer helpers.
 *
 * Should one want to use the same normalization pattern.
 *
 * @public
 */
export const normalizer = {
  pathName,
  searchParams,
  toUrl,
}

export { dirnameNormalizer }

export default dirnameNormalizer
