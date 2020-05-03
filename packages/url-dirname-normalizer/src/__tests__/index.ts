import { FileSystem, JsonFile } from '@rushstack/node-core-library'

import { resolve } from 'path'

export type UrlsExpectedExplanationTuples = [string, string, string][]

export const loadJson = (
  fileName: string,
): Readonly<UrlsExpectedExplanationTuples> => {
  const parentPath = resolve(__dirname, '..', '..', 'resources', 'fixtures')
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = JsonFile.load(
    normalizedFilePath,
  ) as UrlsExpectedExplanationTuples
  const out = Object.freeze(loaded)

  return out
}

export const fixtures = {
  loadSlugificationJsonFixture: () => loadJson('slugification.json'),
}
