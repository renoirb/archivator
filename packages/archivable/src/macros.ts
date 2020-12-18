import { dirnameNormalizer } from 'url-dirname-normalizer'

import { DocumentAssets } from './document-assets'
import type {
  IHashingFn,
  INormalizedAsset,
  INormalizedAssetDest,
  INormalizedAssetReference,
  INormalizedAssetFileExtensionExtractorFn,
  INormalizedAssetReferenceHandlerFn,
} from './types'

/**
 * Create a NormalizedAsset Reference Map, for iteration.
 *
 * @package
 *
 * For any reference found in initial source document, what reference
 * to use to replace it with so that we can use local copy of asset.
 *
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L70-L83 | `transformer.js` lines 70..83, initial implementation}
 * {@link https://github.com/renoirb/archivator/blob/v1.0.0/src/transformer.js#L85-L114 | `transformer.js` lines 85..114, initial implementation}
 */
export const createNormalizedAssetReferenceMap = (
  assets: DocumentAssets,
): Map<string, string> => {
  // The following returns a Map, but if it were an Object hash-map, it
  // would look like this:
  //
  // ```
  // {
  //   'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png' => 'b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png',
  //   '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500' => '63dc122dfd3c702e12714fbe4ba744e463c49edb',
  //   '../../avatar.jpg' => '37fd63a34f42ed3b012b9baac82e97fbe9f9c067.jpg',
  //   '/wp-content/themes/renoirb/assets/img/zce_logo.jpg' => '840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg'
  // }
  // ```
  //
  // This way, we can search and replace the initial attribute value,
  // and rewrite with the reference (i.e. hash) of the file we've downloaded.

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
 * @package
 *
 * This is a pure function, we do not mutate the asset entry.
 * It's done that way so we can decouple from intial iteration, for later use.
 *
 * For example, maybe we'll have another way to figure out the asset file extension.
 * Possibly by using HTTP headers and reading mime-type.
 * That would be done a second time, i.e. not at initial iteration.
 */
export const assetReferenceHandlerFactory = (
  hashingHandler: IHashingFn,
  extensionHandler: INormalizedAssetFileExtensionExtractorFn,
): INormalizedAssetReferenceHandlerFn => {
  return (asset: INormalizedAsset) => {
    const extension = extensionHandler.apply(null, [asset.src])
    const hasExtension = extension !== ''
    const reference = hashingHandler.apply(null, [asset.src]) + extension

    const out: INormalizedAssetReference = {
      reference,
      hasExtension,
    }

    return out
  }
}

/**
 * Return missing properties for normalized asset entity: The file destination (a.k.a. dest).
 *
 * @package
 *
 * @param asset - The asset entity
 * @param sourceDocument - The document this asset has been found in
 */
export const extractNormalizedAsset = (
  asset: INormalizedAsset,
  sourceDocument: string,
): INormalizedAssetDest => {
  const { reference } = asset
  if (typeof reference !== 'string') {
    const message = `Missing asset reference, make sure you’ve used assetReferenceHandlerFactory before using extractNormalizedAsset.`
    throw new Error(message)
  }
  const basePath = dirnameNormalizer(sourceDocument)
  const dest = `${basePath}/${reference}`

  const out: INormalizedAssetDest = {
    dest,
  }

  return out
}

/**
 * List of CSS selectors we typically do not want in a web page archive.
 *
 * @package
 */
export const appendTruncate = (truncateArg: string): string => {
  // Truncate is to strip off any patterns we do not want
  // as part of our archived article.
  let truncate = truncateArg.length === 0 ? '' : `${truncateArg},`
  truncate += 'script,style,noscript,template'
  return truncate
}

/**
 * Ensure we have at least the document's body
 *
 * @package
 */
export const appendSelector = (selectorArg: string): string => {
  // If we know exactly where the main content is, otherwise grab the whole
  // document body.
  return selectorArg.length === 0 ? 'body' : `${selectorArg}`
}
