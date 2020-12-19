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
 * @public
 *
 * So we can prepare for downloading a copy of all the document's assets.
 *
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L186 | `transformer.js` line 186 in initial implementation}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L192 | `transformer.js` line 192 in initial implementation}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L20 | `transformer.js` line 20 in initial implementation}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/normalizer/assets.js#L32 | `normalizer/assets.js` line 32 in initial implementation}
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
   * {@link https://www.carloscaballero.io/design-patterns-iterator/ | ECMAScript 6 Iterator Design Patterns}
   * {@link https://www.carloscaballero.io/understanding-iterator-pattern-in-javascript-typescript-using-symbol-iterator/ | Understanding Iterator Pattern in JavaScript/Typescript using Symbol.Iterator}
   * {@link https://exploringjs.com/es6/ch_iteration.html | Exloring ECMAScript 2015 Iterables and iterators}
   * {@link https://codeburst.io/a-simple-guide-to-es6-iterators-in-javascript-with-examples-189d052c3d8e | CodeBurst.io A Simple Guide to ES6 Iterators}
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
