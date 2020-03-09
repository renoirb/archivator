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

import { factories } from './factories'

// rel=#ApiExtractorImportStarAs
import { summary, words } from './extractors'

// rel=#ApiExtractorImportStarAs
import {
  convertMapToRecordHashMap,
  convertRecordHashMapToMap,
  wordNormalizer,
  nonStopWordIsser,
} from './utils'

/**
 * @public
 *
 * rel=#ApiExtractorImportStarAs
 */
export const extractors = {
  summary,
  words,
}

/**
 * @public
 *
 * rel=#ApiExtractorImportStarAs
 */
export const utils = {
  convertMapToRecordHashMap,
  convertRecordHashMapToMap,
  nonStopWordIsser,
  wordNormalizer,
}

export { ContentDivinator, factories }

export default ContentDivinator

export * from './types'
