import { createHashFunction } from './crypto'
import { assetReferenceHandlerFactory, extractNormalizedAsset } from './macros'
import { assetFileExtensionNormalizer, NormalizedAsset } from './normalize'

import type {
  INormalizedAsset,
  INormalizedAssetReferenceHandlerFn,
  IHashingFn,
} from './types'

/**
 * Assets found on a Web Page Document.
 *
 * So we can prepare for downloading a copy of all the document's assets.
 *
 * Input is a list of resources in many possible format;
 *
 * <!-- See tests DocumentAssets#Happy-Path -->
 * ```js
 * const sourceDocument = 'http://renoirboulanger.com/about/projects'
 * const assets = [
 *   // Case 1: Fully qualified URL that is local to the site
 *   'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
 *   // Case 2: Fully qualified URL that is outside
 *   'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
 *   // Case 3: Fully qualified  URL that is outside and protocol relative
 *   '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
 *   // Case 4: Relative URL to the domain name, starting at root
 *   '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
 *   // Case 5: Relative URL to the current source document
 *   '../../photo.jpg',
 * ]
 * const collection = new DocumentAssets(sourceDocument, assets)
 * ```
 *
 * Should provide us a cleaned up list of assets where is a good guess the asset might be found
 * so we can make a copy and archive them.
 *
 * Notice:
 * - Each dest file are hashes with extension
 * - Gravatar sample started by `//`, and below, at src value, we'll have over http
 * - zce_logo.png is in `/wp-content/...`, but below at src value, it's on `renoirboulanger.com`
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
 * {@see https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L186 `transformer.js` line 186 in initial implementation}
 * {@see https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L192 `transformer.js` line 192 in initial implementation}
 * {@see https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L20 `transformer.js` line 20 in initial implementation}
 * {@see https://github.com/renoirb/archivator/blob/v1.0.0/src/normalizer/assets.js#L32 `normalizer/assets.js` line 32 in initial implementation}
 *
 * @public
 */
export class DocumentAssets implements Iterable<INormalizedAsset> {
  private _iterator: Iterator<string>
  private _referenceHandler?: INormalizedAssetReferenceHandlerFn

  public readonly sourceDocument: string

  /**
   * Assets found on a Web Page Document.
   *
   * @param sourceDocument - URL String to the document where we found assets
   * @param assets - List of asset URLs that were found on sourceDocument, they can be relative paths with or without Search Query or Hash arguments and/or fully-qualified
   */
  constructor(sourceDocument: string, assets: string[] = []) {
    this._iterator = assets[Symbol.iterator]()
    this.sourceDocument = sourceDocument
    Object.defineProperty(this, 'sourceDocument', {
      configurable: false,
      enumerable: true,
      value: sourceDocument,
      writable: false,
    })
  }

  /**
   * What makes it possible to take a DocumentAssets
   * to be for..of iterable.
   */
  [Symbol.iterator](): Iterator<INormalizedAsset> {
    return this
  }

  /**
   * How to process assets during iteration.
   *
   * @TODO Have before and after HTTP call hooks so we can better normalize based on mime-types.
   *
   * @param handler - Bind a function from which we will use to create an asset reference hash
   */
  setReferenceHandler(handler: INormalizedAssetReferenceHandlerFn): void {
    this._referenceHandler = handler.bind(this)
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
  next(): IteratorResult<Readonly<INormalizedAsset>> {
    if (!this._referenceHandler) {
      // If not set after constructor, let’s setup defaults
      const hashingHandler = createHashFunction('sha1', 'hex') as IHashingFn
      const referenceHandler = assetReferenceHandlerFactory(
        hashingHandler,
        assetFileExtensionNormalizer,
      )
      this.setReferenceHandler(referenceHandler)
    }
    const { done, value } = this._iterator.next()
    const sourceDocument = this.sourceDocument
    const referenceHandler = this._referenceHandler
    const maybeAssetUrlString = typeof value === 'string' ? value : false
    if (!done && maybeAssetUrlString) {
      const asset = new NormalizedAsset(sourceDocument, maybeAssetUrlString)
      if (referenceHandler) {
        const { reference } = referenceHandler(asset)
        Object.assign(asset, { reference })
        const { dest } = extractNormalizedAsset(asset, sourceDocument)
        Object.assign(asset, { dest })
      }
      const value = asset.toJSON()
      return { done: false, value }
    } else {
      return { done: true, value: undefined }
    }
  }
}
