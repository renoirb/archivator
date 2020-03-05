import { FileSystem } from '@microsoft/node-core-library'

import { resolve } from 'path'

const loadCsv = (fileName: string): ReadonlyArray<string> => {
  const parentPath = resolve(__dirname, '..', '..', 'resources', 'fixtures')
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  // List all lines that aren’t empty
  const loaded = FileSystem.readFile(normalizedFilePath)
    .split('\n')
    .filter(Boolean)
  // Make them all as TemplateStrings, because jest.each likes them
  const out = Object.freeze(loaded.map(i => `${i}`)) as TemplateStringsArray

  return out
}

const loadFixtureArchiveCsvContents = () => loadCsv('archive.csv')

export const fixtures = {
  loadFixtureArchiveCsvContents,
}
