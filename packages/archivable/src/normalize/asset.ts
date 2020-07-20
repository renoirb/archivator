import { assetUrlNormalizer } from './asset-url'

import type { INormalizedAsset } from '../types'

/**
 * Asset we might want to keep a copy that is found on a document on the www.
 *
 * {@link INormalizedAsset}
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export class NormalizedAsset implements INormalizedAsset {
  /**
   * {@see INormalizedAsset#dest}
   * {@link extractNormalizedAsset}
   */
  dest: string | null = null

  readonly match: string

  /**
   * {@see INormalizedAsset#reference}
   * {@link assetReferenceHandlerFactory}
   */
  reference: string | null = null

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
    // hashWith: CryptoCommonHashingFunctions = 'sha1',
  ) {
    this.match = match
    const urlObj = assetUrlNormalizer(sourceDocument, match)
    this.src = String(urlObj)
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
