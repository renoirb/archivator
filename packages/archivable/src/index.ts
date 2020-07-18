export * from './archivable'

import type {
  NormalizedAssetDestType,
  NormalizedAssetFileExtensionExtractorType,
  NormalizedAssetReferenceHandlerFactoryType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
} from './normalizer'

import { assetFileExtensionNormalizer } from './normalizer'

import {
  assetReferenceHandlerFactory,
  createNormalizedAssetReferenceMap,
  DocumentAssets,
  extractNormalizedAssetDest,
  NormalizedAsset,
} from './asset'

import type {
  CryptoCommonHashingFunctions,
  HashingFunctionType,
  HexBase64Latin1Encoding,
} from './crypto'

import { createHashFunction } from './crypto'

export {
  assetFileExtensionNormalizer,
  assetReferenceHandlerFactory,
  createHashFunction,
  createNormalizedAssetReferenceMap,
  extractNormalizedAssetDest,
  NormalizedAsset,
  DocumentAssets,
}

export type {
  CryptoCommonHashingFunctions,
  HashingFunctionType,
  HexBase64Latin1Encoding,
  NormalizedAssetDestType,
  NormalizedAssetFileExtensionExtractorType,
  NormalizedAssetReferenceHandlerFactoryType,
  NormalizedAssetReferenceType,
  NormalizedAssetType,
}
