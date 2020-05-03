import { sep } from 'path'

/**
 * This represents the configuration of a project that is built by Rush, based on
 * the Rush.json configuration file.
 * @public
 */
export class ArchivatorConfigurationArchive {
  static readonly VALID_NAME_REGEX = /[a-z0-9_\-\.]/gi

  private readonly _archiveName: string

  constructor(private readonly _archiveFolder: string, archiveName?: string) {
    const lastPartArchiveFolder = _archiveFolder.split(sep).pop() as string
    const _archiveName =
      typeof archiveName === 'string' ? archiveName : lastPartArchiveFolder
    const isValidName = ArchivatorConfigurationArchive.VALID_NAME_REGEX.test(
      _archiveName,
    )
    if (!isValidName) {
      const message = `Invalid Archive name ${_archiveName}`
      throw new Error(message)
    }
    const isArchiveNameContainingInArchiveFolder =
      _archiveName === lastPartArchiveFolder
    if (!isArchiveNameContainingInArchiveFolder) {
      const message = `Archive ${archiveName} and archive folder name must have matching names in path ${_archiveFolder}`
      throw new Error(message)
    }

    this._archiveFolder = _archiveFolder
    this._archiveName = _archiveName
  }

  get archiveFolder(): string {
    return this._archiveFolder
  }

  get archiveName(): string {
    return this._archiveName
  }

  toJSON(): { archiveFolder: string; archiveName: string } {
    return {
      archiveName: this.archiveName,
      archiveFolder: this.archiveFolder,
    }
  }
}
