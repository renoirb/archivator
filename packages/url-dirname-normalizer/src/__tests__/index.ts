import { FileSystem, JsonFile } from '@microsoft/node-core-library'

import { resolve } from 'path'

export type UrlsExpectedExplanationTuples = [string, string, string][]

export type AssetsNormalizationUrlsExpectedExplanationTuples = [
  string,
  string,
  string,
  string,
][]

export const load = (
  fileName: string,
):
  | UrlsExpectedExplanationTuples
  | AssetsNormalizationUrlsExpectedExplanationTuples => {
  const parentPath = resolve(__dirname, '..', '..', 'resources', 'fixtures')
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = JsonFile.load(normalizedFilePath) as
    | UrlsExpectedExplanationTuples
    | AssetsNormalizationUrlsExpectedExplanationTuples

  return loaded
}

export const fixtures = {
  load,
}
