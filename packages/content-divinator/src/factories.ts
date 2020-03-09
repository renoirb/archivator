import { FileSystem, JsonFile } from '@microsoft/node-core-library'
import { resolve } from 'path'
import { AvailableStopWordResources, ContentDivinatorType } from './types'
import { ContentDivinator } from './content-divinator'

/**
 * Load resources/stop-words files specific to Divinator.
 *
 * Locales or other json files.
 *
 * @internal
 *
 * @param {string} name — resources/stop-words child directory name, a locale name in text
 * @param {string} fileName — file name to read from. Should only support JSON.
 */
export const loadJson = <T>(name: string, fileName: string): T => {
  const parentPath = resolve(__dirname, '..', 'resources', 'stop-words', name)
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = JsonFile.load(normalizedFilePath)
  const out = Array.isArray(loaded)
    ? Object.freeze(loaded)
    : Object.seal(loaded)

  return out
}

/**
 * Load resources/stop-words files specific to Divinator.
 *
 * Stop word text and other one per line type of content text file.
 *
 * @internal
 *
 * @param {string} name — resources/stop-words child directory name, a locale name in text
 * @param {string} fileName — file name to read from. Should only support Text file.
 */
export const loadText = (name: string, fileName: string): string => {
  const parentPath = resolve(__dirname, '..', 'resources', 'stop-words', name)
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = FileSystem.readFile(normalizedFilePath)

  return loaded
}
/**
 * Create a preconfigured ContentDivinator based on statically stored files.
 *
 * @param {string} predefined — Load a locally available stop-word library, refer to {@link AvailableStopWordResources}
 * @param {string[]} moarLocales — Add more locale tags, if needed
 */
const divinator = (
  predefined: AvailableStopWordResources,
  moarLocales: string[] = [],
): ContentDivinatorType => {
  const locales = loadJson<ReadonlyArray<string>>(predefined, 'locales.json')
  const textFile = loadText(predefined, 'common.txt')
  const stopWords = textFile
    .split('\n')
    .filter(Boolean)
    .sort()

  return new ContentDivinator(stopWords, [...locales, ...moarLocales])
}

/**
 * Predefined factories
 *
 * @public
 */
export const factories = {
  divinator,
}
