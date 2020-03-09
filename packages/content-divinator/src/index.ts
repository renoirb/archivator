/**
 * #ApiExtractorImportStarAs — Until API Extractor does not throw for;
 *
 *     Error: "import * as ___ from ___;" is not supported yet for local files.
 *
 * We'll have to do this manually.
 */
// import * as utils from './utils'; // rel=#ApiExtractorImportStarAs
// import * as utils from './utils'; // rel=#ApiExtractorImportStarAs

import { ContentDivinator } from './content-divinator'

// rel=#ApiExtractorImportStarAs
import { summary, words } from './extractors'

import {
  convertMapToRecordHashMap,
  convertRecordHashMapToMap,
  wordNormalizer,
  nonStopWordIsser,
} from './utils'

/**
 * Content processing and extraction utilities.
 *
 * @public
 */
export const extractors = {
  summary,
  words,
}

/**
 * Converters and utilities.
 *
 * @public
 */
export const utils = {
  convertMapToRecordHashMap,
  convertRecordHashMapToMap,
  nonStopWordIsser,
  wordNormalizer,
}

export { ContentDivinator }

export default ContentDivinator

export * from './types'
