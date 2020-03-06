import {
  directoryNameNormalizer,
  assetFileExtensionNormalizer,
  NormalizedAssetDestType,
  NormalizedAssetFileExtensionExtractorType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
} from './normalizer'

import {
  assetReferenceHandlerFactory,
  createNormalizedAssetReferenceMap,
  DocumentAssets,
  extractNormalizedAssetDest,
  NormalizedAsset,
} from './asset'

import {
  CryptoCommonHashingFunctions,
  HexBase64Latin1Encoding,
} from './hashing'

export {
  assetReferenceHandlerFactory,
  createNormalizedAssetReferenceMap,
  CryptoCommonHashingFunctions,
  directoryNameNormalizer,
  DocumentAssets,
  extractNormalizedAssetDest,
  HexBase64Latin1Encoding,
  assetFileExtensionNormalizer,
  NormalizedAsset,
  NormalizedAssetDestType,
  NormalizedAssetFileExtensionExtractorType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
}

export default directoryNameNormalizer
