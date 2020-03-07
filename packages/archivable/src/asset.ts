import { directoryNameNormalizer } from 'url-dirname-normalizer'

import {
  assetUrlNormalizer,
  assetFileExtensionNormalizer,
  NormalizedAssetDestType,
  NormalizedAssetReferenceHandlerType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
  NormalizedAssetFileExtensionExtractorType,
} from './normalizer'

import { createHashFunction, HashingFunctionType } from './crypto'

/**
 * For any reference found in initial source document, what reference
 * to use to replace it with so that we can use local copy of asset.
 *
 * The following returns a Map, but if it were an Object hash-map, it
 * would look like this:
 *
 * ```
 * {
 *   'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png' => 'b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png',
 *   '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500' => '63dc122dfd3c702e12714fbe4ba744e463c49edb',
 *   '../../avatar.jpg' => '37fd63a34f42ed3b012b9baac82e97fbe9f9c067.jpg',
 *   '/wp-content/themes/renoirb/assets/img/zce_logo.jpg' => '840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg'
 * }
 * ```
 *
 * This way, we can search and replace the initial attribute value,
 * and rewrite with the reference (i.e. hash) of the file we've downloaded.
 *
 * ----
 *
 * See earlier implementation:
 *   v1.0.0, initial implementation:
 *     links:
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L70-L83
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L85-L114
 *
 * ----
 *
 * @public
 */
export const createNormalizedAssetReferenceMap = (
  assets: DocumentAssets,
): Map<string, string> => {
  const out = new Map<string, string>()
  for (const normalized of assets) {
    if (normalized.reference) {
      out.set(normalized.match, normalized.reference)
    } else {
      const message = `Missing asset reference for ${JSON.stringify(
        normalized,
      )}`
      throw new Error(message)
    }
  }

  return out
}

/**
 * Return missing properties for normalized asset entity: The file hash (a.k.a. reference).
 *
 * This is a pure function, we do not mutate the asset entry.
 * It's done that way so we can decouple from intial iteration, for later use.
 *
 * For example, maybe we'll have another way to figure out the asset file extension.
 * Possibly by using HTTP headers and reading mime-type.
 * That would be done a second time, i.e. not at initial iteration.
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export const assetReferenceHandlerFactory = (
  hashingHandler: HashingFunctionType,
  extensionHandler: NormalizedAssetFileExtensionExtractorType,
): NormalizedAssetReferenceHandlerType => {
  return (asset: NormalizedAssetType) => {
    const extension = extensionHandler.apply(null, [asset.src])
    const hasExtension = extension !== ''
    const reference = hashingHandler.apply(null, [asset.src]) + extension

    const out: NormalizedAssetReferenceType = {
      reference,
      hasExtension,
    }

    return out
  }
}

/**
 * Return missing properties for normalized asset entity: The file destination (a.k.a. dest).
 *
 * @param asset {NormalizedAssetType} — The asset entity
 * @param sourceDocument {string} — The document this asset has been found in
 */
export const extractNormalizedAssetDest = (
  asset: NormalizedAssetType,
  sourceDocument: string,
): NormalizedAssetDestType => {
  const { reference } = asset
  if (typeof reference !== 'string') {
    const message = `Missing asset reference, make sure you’ve used assetReferenceHandlerFactory before using extractNormalizedAssetDest.`
    throw new Error(message)
  }
  const basePath = directoryNameNormalizer(sourceDocument)
  const dest = `${basePath}/${reference}`

  const out: NormalizedAssetDestType = {
    dest,
  }

  return out
}

/**
 * Asset we might want to keep a copy that is found on a document on the www.
 *
 * {@link NormalizedAssetType}
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export class NormalizedAsset implements NormalizedAssetType {
  /**
   * {@see NormalizedAssetType#dest}
   * {@link extractNormalizedAssetDest}
   */
  dest: string | null = null

  readonly match: string

  /**
   * {@see NormalizedAssetType#reference}
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

  toJSON(): Readonly<NormalizedAssetType> {
    const out: NormalizedAssetType = {
      dest: this.dest,
      match: this.match,
      reference: this.reference,
      src: this.src,
    }

    return Object.seal(out)
  }
}

/**
 * Rework each asset URL so we can download a copy.
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
 * const collection = new DocumentAssets(sourceDocument, matches)
 * ```
 *
 * Should provide us a cleaned up list of assets where is a good guess the asset might be found
 * so we can make a copy and archive them.
 *
 * Notice:
 * - Each dest file are hashes with extension
 * - Gravatar sample started by //, and below, at src value, we'll have over http
 * - zce_logo.png is in /wp-content/..., but below at src value, it's on renoirboulanger.com
 *
 * We should receive something similar to this;
 *
 * ```js
 * // Notice that DocumentAssets returns an iterable, we can iterate as if it looked like this;
 * const collection = [
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
 * ----
 *
 * See earlier implementation:
 *   v1.0.0, initial implementation:
 *     links:
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L186
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L192
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L20
 *       - url: https://github.com/renoirb/archivator/blob/v1.0.0/src/normalizer/assets.js#L32
 *
 * ----
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export class DocumentAssets implements Iterable<NormalizedAssetType> {
  private iterator: Iterator<string>
  private referenceHandler?: NormalizedAssetReferenceHandlerType
  constructor(
    public readonly sourceDocument: string,
    readonly assets: string[] = [],
  ) {
    this.iterator = assets[Symbol.iterator]()
  }
  [Symbol.iterator]() {
    return this
  }
  setReferenceHandler(handler: NormalizedAssetReferenceHandlerType): void {
    this.referenceHandler = handler.bind(this)
  }
  /**
   * Anything done here allows us to build full-blown objects only at iteration time.
   * This is following ECMAScript 2015+ Iteration protocol.
   *
   * Bookmarks:
   * - https://www.carloscaballero.io/design-patterns-iterator/
   * - https://www.carloscaballero.io/understanding-iterator-pattern-in-javascript-typescript-using-symbol-iterator/
   * - https://exploringjs.com/es6/ch_iteration.html
   * - https://codeburst.io/a-simple-guide-to-es6-iterators-in-javascript-with-examples-189d052c3d8e
   */
  next(): IteratorResult<Readonly<NormalizedAssetType>> {
    if (!this.referenceHandler) {
      // If not set after constructor, let’s setup defaults
      const hashingHandler = createHashFunction(
        'sha1',
        'hex',
      ) as HashingFunctionType
      const referenceHandler = assetReferenceHandlerFactory(
        hashingHandler,
        assetFileExtensionNormalizer,
      )
      this.setReferenceHandler(referenceHandler)
    }
    const { done, value } = this.iterator.next()
    const sourceDocument = this.sourceDocument
    const referenceHandler = this.referenceHandler
    const maybeAssetUrlString = typeof value === 'string' ? value : false
    if (!done && maybeAssetUrlString) {
      const asset = new NormalizedAsset(sourceDocument, maybeAssetUrlString)
      if (referenceHandler) {
        const { reference } = referenceHandler(asset)
        Object.assign(asset, { reference })
        const { dest } = extractNormalizedAssetDest(asset, sourceDocument)
        Object.assign(asset, { dest })
      }
      const value = asset.toJSON()
      return { done: false, value }
    } else {
      return { done: true, value: undefined }
    }
  }
}
