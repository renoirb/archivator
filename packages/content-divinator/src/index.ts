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

// rel=#ApiExtractorImportStarAs
import {
  AvailableStopWordResources,
  //   MapToRecordHashMapFactoryType,
  //   NonStopWordIsserType,
  //   RecordToMapFactoryType,
  //   SummaryRecordType,
  //   WordNormalizerType,
  //   WordsType,
  //   WordUsageMapType,
} from './types'

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

export {
  AvailableStopWordResources,
  ContentDivinator,
  // MapToRecordHashMapFactoryType,
  // NonStopWordIsserType,
  // RecordToMapFactoryType,
  // SummaryRecordType,
  // WordNormalizerType,
  // WordsType,
  // WordUsageMapType,
}

export default ContentDivinator
