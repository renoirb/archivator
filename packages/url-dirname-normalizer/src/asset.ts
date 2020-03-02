import { assetUrlNormalizer, directoryNameNormalizer } from './normalizer'
import { createHashFunction, CryptoCommonHashingFunctions } from './hashing'
import { URL } from './url'

/**
 * Asset URL asset file name hasher.
 *
 * For any given Rewrite a file name based on an URL they were downloaded from.
 */
export const assetReferenceHash = (
  resourceUrl: URL,
  hashWith: CryptoCommonHashingFunctions = 'sha1',
): string => {
  const pathname = resourceUrl.pathname
  // svg, png, jpg, webm
  let extension = ''
  const matches = pathname.match(/(\.[a-z]{2,})$/i)
  if (matches !== null && Array.isArray(matches) && matches[0]) {
    extension = matches[0]
  }

  const hashed = createHashFunction(hashWith, 'hex')(String(resourceUrl))
  return hashed + extension.toLowerCase()
}

/**
 * Normalized Asset reference.
 *
 * For any "match" (i.e. initial value), where ("src") to download the asset in relation to the
 * source document. When saving downloaded assets, save into "dest", and eventually, refactor
 * source document's HTML source to a new "reference" name.
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export interface NormalizedAssetInterface {
  /**
   * Fully qualified filesystem path where to save asset.
   *
   * Pretty much concatenation of `directoryNameNormalizer(sourceDocument)`
   * and the value of NormalizedAssetInterface#reference.
   */
  dest: string

  /**
   * Original asset found in source document.
   *
   * As received from constructor argument.
   * Will be useful later on should we want to replace HTML Document's assets
   * with a local copy, named after NormalizedAssetInterface#reference.
   */
  match: string

  /**
   * File name, as a hash and a file extension.
   *
   * Instead of keeping file name, we are normalizing as a hash + file extension.
   * We can later-on replace from HTML Document's asset match with this reference instead.
   */
  reference: string

  /**
   * URL on which to download asset from.
   *
   * URL to asset, should be normalized first via normalizedAssetReference
   * Notice it isn't the same value as provided at constructor time.
   */
  src: string
}

/**
 * {@link NormalizedAssetInterface}
 */
export class NormalizedAsset implements NormalizedAssetInterface {
  readonly dest: string

  readonly match: string

  readonly reference: string

  readonly src: string

  /**
   * Normalize Asset reference.
   *
   * @param sourceDocument {string} — URL of the document in which we would download the asset from
   * @param match {string} - Value into image's src attribute value
   * @param hashWith {string} — Hashing function to use to normalize reference, defaults to 'sha256'
   */
  constructor(
    sourceDocument: string,
    match: string,
    hashWith: CryptoCommonHashingFunctions = 'sha1',
  ) {
    this.match = match

    const basePath = directoryNameNormalizer(sourceDocument)
    const urlObj = assetUrlNormalizer(sourceDocument, match)

    const reference = assetReferenceHash(urlObj, hashWith)
    this.src = String(urlObj)
    this.reference = reference
    this.dest = `${basePath}/${reference}`
  }

  toJSON(): NormalizedAssetInterface {
    const out: NormalizedAssetInterface = {
      dest: this.dest,
      match: this.match,
      reference: this.reference,
      src: this.src,
    }

    return out
  }
}

/**
 * Rework each asset URL so we can download a copy.
 *
 * See earlier implementation:
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L186
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L192
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L20
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/normalizer/assets.js#L32
 *
 * ---
 *
 * Input is a list of resources in many possible format;
 *
 * ```js
 * const sourceDocument = 'http://renoirboulanger.com/page/3/'
 * const matches = [
 *   'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
 *   'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
 *   '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
 *   '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
 * ]
 * ```
 *
 * Running assetCollectionIterator(sourceDocument, matches) gives us a cleaned up list
 * of assets where is a good guess the asset might be found
 * so we can make a copy and archive them.
 *
 * Notice:
 * - Each dest file are hashes with extension
 * - Gravatar sample started by //, and below, at src value, we'll have over http
 * - zce_logo.png is in /wp-content/..., but below at src value, it's on renoirboulanger.com
 *
 * We should receive something similar to this;
 *
 * ```json
 * [
 *   {
 *     "dest": "renoirboulanger.com/page/3/430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg",
 *     "match": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *     "reference": "430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg",
 *     "src": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *   },{
 *     "dest": "renoirboulanger.com/page/3/b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png",
 *     "match": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *     "reference": "b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png",
 *     "src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *   },{
 *     "dest": "renoirboulanger.com/page/3/63dc122dfd3c702e12714fbe4ba744e463c49edb",
 *     "match": "//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *     "reference": "63dc122dfd3c702e12714fbe4ba744e463c49edb",
 *     "src": "http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *   },{
 *     "dest": "renoirboulanger.com/page/3/840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg",
 *     "match": "/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *     "reference": "840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg",
 *     "src": "http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *   }
 * ]
 * ```
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export function* assetCollectionNormalizer(
  sourceDocument: string,
  assets: string[],
  hashWith?: CryptoCommonHashingFunctions,
): IterableIterator<NormalizedAssetInterface> {
  for (const asset of assets) {
    const normalized = new NormalizedAsset(sourceDocument, asset, hashWith)
    yield normalized
  }
}
