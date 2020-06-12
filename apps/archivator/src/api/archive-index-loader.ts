import { FileSystem } from '@rushstack/node-core-library'
import { resolve } from 'path'

export const archiveIndexLoader = (dir: string): ReadonlyArray<string> => {
  const parentPath = resolve(__dirname, dir)
  const normalizedFilePath = resolve(parentPath, 'archivator.csv')
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(
      `Cannot find archivator.csv archive file at ${normalizedFilePath}`,
    )
  }

  // List all lines that aren’t empty
  const loaded = FileSystem.readFile(normalizedFilePath)
    .split('\n')
    .filter(Boolean)
  // Make them all as TemplateStrings, because jest.each likes them
  const out = Object.freeze(loaded.map((i) => `${i}`)) as TemplateStringsArray

  return out
}
