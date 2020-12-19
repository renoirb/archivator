import { ContentDivinator } from './content-divinator'

import { convertMapToRecordHashMap, convertRecordHashMapToMap } from './utils'

export type {
  WordUsageMapType,
  WordsType,
  NonStopWordIsserType,
  WordNormalizerType,
  ISummaryRecordType,
} from './types'

/**
 * @public
 */
export const utils = {
  convertMapToRecordHashMap,
  convertRecordHashMapToMap,
}

export { ContentDivinator }

export default ContentDivinator
