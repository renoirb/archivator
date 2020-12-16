/**
 * The first line of the archive index CSV file.
 *
 * @public
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 */
export const ArchivableOrderedInputUrlTruncateTuplesFirstLine =
  '"Web Page URL";"CSS Selectors for main content";"CSS Selectors to strip content off"'

/**
 * An Archivable Entity.
 *
 * @public
 *
 * For a given source document URL, where to extract the main content ("selector"),
 * and what parts of the page aren't relevant to an archive ("truncate").
 */
export interface IArchivable {
  /**
   * Based on the constructor url argument, where on the filesystem to archive the web page
   */
  archive: string | null
  /**
   * CSS selector where the principal web page content is in
   */
  selector: string
  /**
   * Coma Separated List of CSS selectors to strip content off (e.g. ads, orthogonal content)
   */
  truncate: string
  /**
   * URL to the source document
   */
  url: string
}

/**
 * Tuple representation of what comes from a source .csv file
 *
 * @public
 *
 * Given every row in source file .csv
 *
 * e.g.
 *
 * http://example.org/a/b.html;body;.ad,.social-button
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 *
 * {@see IArchivableOrderedInputUrlTruncateTuple}
 */
export type IArchivableOrderedInputUrlTruncateTuple = [string, string, string]

/**
 * Asset URL asset file name hasher.
 *
 * @internal
 *
 * For any given Rewrite a file name based on an URL they were downloaded from.
 *
 * @param assetUrl - The asset’s URL, may not contain the file extension
 * @return - File extension (e.g. `.png`), or empty string.
 */
export type INormalizedAssetFileExtensionExtractorFn = (
  assetUrl: string,
) => string

/**
 * The file hash (a.k.a. reference) for INormalizedAsset.
 *
 * @internal
 *
 * @property reference - hash representation of the asset URL
 * @property hasExtension - was the asset with a file extension?
 */
export interface INormalizedAssetReference {
  reference: string
  hasExtension: boolean
}

/**
 * Function from which we take a INormalizedAsset and transform it into
 * a description from which we can initiate an HTTP call to copy items from.
 *
 * @internal
 *
 * @param asset - Asset to pass through normalization
 * @return Add missing properties to asset with reference and dest properties
 */
export type INormalizedAssetReferenceHandlerFn = (
  asset: INormalizedAsset,
) => INormalizedAssetReference

/**
 * How should we handle how to hash asset file reference
 * and how to add file extension (or not).
 *
 * @internal
 */
export type INormalizedAssetReferenceHandlerFactoryFn = (
  hashingHandler: IHashingFn,
  extensionHandler: INormalizedAssetFileExtensionExtractorFn,
) => INormalizedAssetReferenceHandlerFn

/**
 * Available Crypto Hashing Functions.
 * Runtime might have a different list though.
 *
 * Also, this isn't planned to run client-side (in a Web Browser).
 * Maybe the following list won't work.
 *
 * @public
 */
export type CryptoCommonHashingFunctions =
  | 'sha1'
  | 'sha256'
  | 'md5'
  | 'md5-sha1'
  | 'mdc2'
  | 'sha512'
  | 'sha224'
  | string

/**
 * Take a message, return a hashed representation of it.
 *
 * @internal
 */
export type IHashingFn = (message: string) => string

/**
 * The file destination (a.k.a. dest) for INormalizedAsset.
 *
 * @public
 */
export interface INormalizedAssetDest {
  dest: string
}

/**
 * Normalized Asset reference.
 *
 * @public
 *
 * For any "match" (i.e. initial value), where ("src") to download the asset in relation to the
 * source document. When saving downloaded assets, save into "dest", and eventually, refactor
 * source document's HTML source to a new "reference" name.
 */
export interface INormalizedAsset {
  /**
   * Fully qualified filesystem path where to save asset.
   *
   * Pretty much concatenation of `dirnameNormalizer(sourceDocument)`
   * and the value of INormalizedAsset#reference.
   *
   * {@see INormalizedAssetDest}
   */
  dest: string | null

  /**
   * Original asset found in source document.
   *
   * As received from constructor argument.
   * Will be useful later on should we want to replace HTML Document's assets
   * with a local copy, named after INormalizedAsset#reference.
   */
  readonly match: string

  /**
   * File name, as a hash and a file extension.
   *
   * Instead of keeping file name, we are normalizing as a hash + file extension.
   * We can later-on replace from HTML Document's asset match with this reference instead.
   *
   * {@see INormalizedAssetReference}
   */
  reference: string | null

  /**
   * URL on which to download asset from.
   *
   * URL to asset, should be normalized first via normalizedAssetReference
   * Notice it isn't the same value as provided at constructor time.
   */
  readonly src: string
}

/**
 * Normalized Asset reference Entity.
 *
 * @internal
 *
 * {@see INormalizedAsset}
 */
export interface INormalizedAssetEntity {
  toJSON(): Readonly<INormalizedAsset>
}
