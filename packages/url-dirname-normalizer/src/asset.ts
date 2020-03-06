import {
  assetUrlNormalizer,
  directoryNameNormalizer,
  maybeAssetFileExtensionNormalizer,
  NormalizedAssetDestType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
} from './normalizer'
import {
  createHashFunction,
  CryptoCommonHashingFunctions,
  HashingFunctionType,
  HexBase64Latin1Encoding,
} from './hashing'

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
 *
 * @param asset {NormalizedAssetType} — The asset entity
 * @param hasher {HashingFunctionType} — Hashing function type
 */
export const extractNormalizedAssetReference = (
  asset: NormalizedAssetType,
  hasher: HashingFunctionType,
): NormalizedAssetReferenceType => {
  const extension = maybeAssetFileExtensionNormalizer(asset.src)
  const hasExtension = extension !== ''
  const reference = hasher.apply(null, [asset.src]) + extension

  const out: NormalizedAssetReferenceType = {
    reference,
    hasExtension,
  }

  return out
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
    const message = `Missing asset reference, make sure you’ve used extractNormalizedAssetReference before using extractNormalizedAssetDest.`
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
 * @description Asset we might want to keep a copy that is found on a document on the www.
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
   * {@link extractNormalizedAssetReference}
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
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L186
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L192
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/transformer.js#L20
 * - https://github.com/renoirb/archivator/blob/29aff30c/src/normalizer/assets.js#L32
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export class DocumentAssets implements Iterable<NormalizedAssetType> {
  private iterator: Iterator<string>
  private hasher?: HashingFunctionType
  constructor(
    public readonly sourceDocument: string,
    readonly assets: string[] = [],
  ) {
    this.iterator = assets[Symbol.iterator]()
    this.setHasherParams()
  }
  [Symbol.iterator]() {
    return this
  }
  setHasherParams(
    hash: CryptoCommonHashingFunctions = 'sha1',
    encoding: HexBase64Latin1Encoding = 'hex',
  ): void {
    this.hasher = createHashFunction(hash, encoding) as HashingFunctionType
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
    const { done, value } = this.iterator.next()
    const sourceDocument = this.sourceDocument
    const maybeAssetUrlString = typeof value === 'string' ? value : false
    if (!done && maybeAssetUrlString) {
      const asset = new NormalizedAsset(sourceDocument, maybeAssetUrlString)
      if (this.hasher) {
        const { reference } = extractNormalizedAssetReference(
          asset,
          this.hasher,
        )
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
