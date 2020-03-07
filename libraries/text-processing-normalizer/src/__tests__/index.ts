import { FileSystem, JsonFile } from '@microsoft/node-core-library'

import { resolve } from 'path'

export const loadJson = <T>(fileName: string): T => {
  const parentPath = resolve(__dirname, '..', '..', 'resources', 'fixtures')
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

const loadText = (fileName: string): string => {
  const parentPath = resolve(__dirname, '..', '..', 'resources', 'fixtures')
  const normalizedFilePath = resolve(parentPath, fileName)
  if (!FileSystem.exists(normalizedFilePath)) {
    throw new Error(`Input file not found: ${fileName} in ${parentPath}`)
  }

  const loaded = FileSystem.readFile(normalizedFilePath)

  return loaded
}

export const fixtures = {
  loadText,
  loadJson,
}
