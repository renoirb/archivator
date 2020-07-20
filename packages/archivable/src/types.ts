/**
 * The first line of the archive index CSV file
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 *
 * @public
 * {@link parseArchivableCsvLine}
 */
export const ArchivableOrderedInputUrlTruncateTuplesFirstLine =
  '"Web Page URL";"CSS Selectors for main content";"CSS Selectors to strip content off"'

/**
 * An Archivable Entity.
 *
 * For a given source document URL, where to extract the main content ("selector"),
 * and what parts of the page aren't relevant to an archive ("truncate").
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
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
 * Given every row in source file .csv
 *
 * ```csv
 * http://example.org/a/b.html;body;.ad,.social-button
 * ```
 *
 * 1. First item is a fully qualified source document URL (i.e. a Web Page's address)
 * 2. _selector_, A CSS selector where the main content is
 * 3. _truncate_, A list of CSS selectors to strip off (e.g. ads, orthogonal content)
 *
 * This is the shape of data input we can use for iteration.
 *
 * @public
 *
 * {@link parseArchivableCsvLine}
 * {@link ArchivableOrderedInputUrlTruncateTuplesFirstLine}
 */
export type ArchivableOrderedInputUrlTruncateTuplesType = [
  string,
  string,
  string,
]

/**
 * Asset URL asset file name hasher.
 *
 * For any given Rewrite a file name based on an URL they were downloaded from.
 *
 * @public
 * @param assetUrl {string} — The asset’s URL, may not contain the file extension
 * @return {string} — File extension (e.g. `.png`), or empty string.
 */
export type NormalizedAssetFileExtensionExtractorType = (
  assetUrl: string,
) => string

/**
 * The file hash (a.k.a. reference) for INormalizedAsset.
 * @public
 */
export interface INormalizedAssetReferenceType {
  reference: string
  hasExtension: boolean
}

/**
 * Function from which we take a INormalizedAsset and transform it into
 * a description from which we can initiate an HTTP call to copy items from.
 *
 * @public
 */
export type NormalizedAssetReferenceHandlerType = (
  asset: INormalizedAsset,
) => INormalizedAssetReferenceType

/**
 * How should we handle how to hash asset file reference
 * and how to add file extension (or not).
 *
 * @public
 */
export type NormalizedAssetReferenceHandlerFactoryType = (
  hashingHandler: HashingFunctionType,
  extensionHandler: NormalizedAssetFileExtensionExtractorType,
) => NormalizedAssetReferenceHandlerType

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
 * @public
 */
export type HashingFunctionType = (message: string) => string

/**
 * The file destination (a.k.a. dest) for INormalizedAsset.
 *
 * @public
 */
export interface INormalizedAssetDestination {
  dest: string
}

/**
 * Normalized Asset reference.
 *
 * For any "match" (i.e. initial value), where ("src") to download the asset in relation to the
 * source document. When saving downloaded assets, save into "dest", and eventually, refactor
 * source document's HTML source to a new "reference" name.
 *
 * @public
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export interface INormalizedAsset {
  /**
   * Fully qualified filesystem path where to save asset.
   *
   * Pretty much concatenation of `dirnameNormalizer(sourceDocument)`
   * and the value of INormalizedAsset#reference.
   *
   * {@see INormalizedAssetDestination}
   */
  dest: string | null

  /**
   * Original asset found in source document.
   *
   * As received from constructor argument.
   * Will be useful later on should we want to replace HTML Document's assets
   * with a local copy, named after INormalizedAsset#reference.
   */
  match: string

  /**
   * File name, as a hash and a file extension.
   *
   * Instead of keeping file name, we are normalizing as a hash + file extension.
   * We can later-on replace from HTML Document's asset match with this reference instead.
   *
   * {@see INormalizedAssetReferenceType}
   */
  reference: string | null

  /**
   * URL on which to download asset from.
   *
   * URL to asset, should be normalized first via normalizedAssetReference
   * Notice it isn't the same value as provided at constructor time.
   */
  src: string
}
