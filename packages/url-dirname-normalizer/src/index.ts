import { main } from './main'
import { pathName, searchParams, toUrl } from './normalizer'

export const dirnameNormalizer = main

export default dirnameNormalizer

/**
 * Normalizer helpers.
 *
 * Should one want to use the same normalization pattern.
 *
 * @public
 */
export { pathName, searchParams, toUrl }
