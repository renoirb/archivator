import { FileSystem } from '@microsoft/node-core-library'

import { resolve } from 'path'

export const loadCsv = (dir: string): ReadonlyArray<string> => {
  const parentPath = resolve(__dirname, dir)
  const normalizedFilePath = resolve(parentPath, 'archive.csv')
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Cannot find archive file at ${normalizedFilePath}`)
  }

  // List all lines that aren’t empty
  const loaded = FileSystem.readFile(normalizedFilePath)
    .split('\n')
    .filter(Boolean)
  // Make them all as TemplateStrings, because jest.each likes them
  const out = Object.freeze(loaded.map(i => `${i}`)) as TemplateStringsArray

  return out
}
