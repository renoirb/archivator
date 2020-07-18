import { resolve } from 'path'
import { FileSystem, JsonFile } from '@rushstack/node-core-library'
import type {
  AvailableStopWordResources,
  IContentDivinatorSetupFactoryType,
} from './types'

/**
 * Load resources/stop-words files specific to Divinator.
 *
 * Locales or other json files.
 *
 * @internal
 *
 * @param name - resources/stop-words child directory name, a locale name in text
 * @param fileName - file name to read from. Should only support JSON.
 */
export const _loadJson = <T>(name: string, fileName: string): T => {
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
 * @param name - resources/stop-words child directory name, a locale name in text
 * @param fileName - file name to read from. Should only support Text file.
 */
export const _loadText = (name: string, fileName: string): string => {
  const parentPath = resolve(__dirname, '..', 'resources', 'stop-words', name)
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = FileSystem.readFile(normalizedFilePath)

  return loaded
}

/**
 * @internal
 */
export const _createContentDivinatorSetup = (
  predefined: AvailableStopWordResources,
  moarLocales: string[] = [],
): IContentDivinatorSetupFactoryType => {
  const locales = _loadJson<ReadonlyArray<string>>(predefined, 'locales.json')
  const textFile = _loadText(predefined, 'common.txt')
  const stopWords = textFile.split('\n').filter(Boolean).sort()

  const out: IContentDivinatorSetupFactoryType = {
    locales: [...locales, ...moarLocales],
    stopWords,
  }

  return out
}
