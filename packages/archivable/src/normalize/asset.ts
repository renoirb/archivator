import { assetUrlNormalizer } from './asset-url'

import type { INormalizedAsset, INormalizedAssetEntity } from '../types'

/**
 * An image or picture we want to keep a copy alongside its web page document source.
 *
 * @public
 */
export class NormalizedAsset
  implements INormalizedAsset, INormalizedAssetEntity {
  readonly match: string

  readonly src: string

  /**
   * {@see INormalizedAsset#dest}
   * {@see extractNormalizedAsset}
   */
  dest: string | null = null

  /**
   * {@see INormalizedAsset#reference}
   * {@see assetReferenceHandlerFactory}
   */
  reference: string | null = null

  /**
   * Normalize Asset reference.
   *
   * @param sourceDocument - URL of the document in which we would download the asset from
   * @param match - Value into image's src attribute value
   */
  constructor(
    sourceDocument: string,
    match: string,
    // hashWith: CryptoCommonHashingFunctions = 'sha1',
  ) {
    this.match = match
    const urlObj = assetUrlNormalizer(sourceDocument, match)
    this.src = String(urlObj)
    Object.freeze(this.src)
    Object.freeze(this.match)
  }

  toJSON(): Readonly<INormalizedAsset> {
    const out: INormalizedAsset = {
      dest: this.dest,
      match: this.match,
      reference: this.reference,
      src: this.src,
    }

    return Object.seal(out)
  }
}
