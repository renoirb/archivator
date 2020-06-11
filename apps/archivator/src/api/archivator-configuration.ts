import { FileSystem, JsonFile, JsonSchema } from '@rushstack/node-core-library'
import * as fs from 'fs'
import { join, dirname, resolve, extname } from 'path'
import { trueCasePathSync } from 'true-case-path'

import {
  ArchivableOrderedInputUrlTruncateTuplesFirstLine,
  Archivable,
} from '@archivator/archivable'

import { archiveIndexLoader } from './archive-index-loader'
import { ArchivatorConfigurationArchive } from './archivator-configuration-archive'
import {
  ArchivatorConfigurationArchiveJson,
  ArchivatorConfigurationJsonInterface,
  TryFindArchivatorJsonLocationOptionsInterface,
} from './configuration'
import { ArchivatorConstants } from '../logic/archivator-constants'

/**
 * This represents the Archivator archive configuration for a directory,
 * based on the "archivator.json" configuration file.
 * @public
 */
export class ArchivatorConfiguration {
  private static _jsonSchema: JsonSchema = JsonSchema.fromFile(
    join(__dirname, '../../resources/schemas/archivator.schema.json'),
  )

  private _archivatorJsonFilename: string
  private _archivatorJsonFolder: string

  private _archives: ArchivatorConfigurationArchive[] = []
  private _archivesByName = new Map<string, ArchivatorConfigurationArchive>()

  /**
   * Instead of using constructor, use one of the following factories:
   * - ArchivatorConfiguration.loadFromConfigurationFile()
   * - ArchivatorConfiguration.loadFromDefaultLocation()
   *
   * Following pattern from:
   * https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/api/RushConfiguration.ts#L489
   */
  private constructor(
    archivatorConfigurationJson: ArchivatorConfigurationJsonInterface,
    archivatorJsonFilename: string,
  ) {
    this._archivatorJsonFilename = archivatorJsonFilename
    this._archivatorJsonFolder = dirname(archivatorJsonFilename)

    // We sort the archives array in alphabetical order.
    // This ensures that the packages are processed in a deterministic order
    const sortedList: ArchivatorConfigurationArchiveJson[] = archivatorConfigurationJson.archives.slice(
      0,
    )
    sortedList.sort(
      (
        a: ArchivatorConfigurationArchiveJson,
        b: ArchivatorConfigurationArchiveJson,
      ) => a.archiveName.localeCompare(b.archiveName),
    )

    for (const { archiveName, archiveFolder } of sortedList) {
      const archive: ArchivatorConfigurationArchive = new ArchivatorConfigurationArchive(
        archiveFolder,
        archiveName,
      )

      const archivatorArchiveFolder = join(
        this.archivatorJsonFolder,
        archiveFolder,
      )
      ArchivatorConfiguration.ensureValidArchiveFolder(archivatorArchiveFolder)

      this._archives.push(archive)
      if (this._archivesByName.get(archive.archiveName)) {
        let message = `The archive name "${archive.archiveName}" was specified more than once`
        message += ` in the archivator.json configuration file.`
        throw new Error(message)
      }
      this._archivesByName.set(archive.archiveName, archive)
    }
  }

  /**
   * Loads the configuration data from an archivator.json configuration file and returns
   * an ArchivatorConfiguration object.
   *
   * Following pattern from:
   * https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/api/RushConfiguration.ts#L729
   */
  public static loadFromConfigurationFile(
    configurationFile: string,
  ): ArchivatorConfiguration {
    let resolvedFilename: string = resolve(configurationFile)
    // Load the archivator.json before we fix the casing.
    // If the case is wrong on a case-sensitive filesystem, the next line show throw.
    const configuration: ArchivatorConfigurationJsonInterface = JsonFile.load(
      resolvedFilename,
    )

    try {
      resolvedFilename = trueCasePathSync(resolvedFilename)
    } catch (error) {
      /* ignore errors from true-case-path */
    }

    ArchivatorConfiguration._jsonSchema.validateObject(
      configuration,
      resolvedFilename,
    )

    return new ArchivatorConfiguration(configuration, resolvedFilename)
  }

  /**
   * Load archivator.json from current directory.
   *
   * Following pattern from:
   * https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/api/RushConfiguration.ts#L780
   */
  public static loadFromDefaultLocation(
    options?: TryFindArchivatorJsonLocationOptionsInterface,
  ): ArchivatorConfiguration {
    const archivatorJsonLocation:
      | string
      | undefined = ArchivatorConfiguration.tryFindArchivatorJsonLocation(
      options,
    )

    if (archivatorJsonLocation) {
      return ArchivatorConfiguration.loadFromConfigurationFile(
        archivatorJsonLocation,
      )
    } else {
      const message = `archivator.json configuration file not found in ${archivatorJsonLocation}`
      throw new Error(message)
    }
  }

  /**
   * Find the archivator.json location and return the path,
   * or undefined if a archivator.json can't be found.
   *
   * Following pattern from:
   * https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/api/RushConfiguration.ts#L793
   */
  public static tryFindArchivatorJsonLocation(
    options?: TryFindArchivatorJsonLocationOptionsInterface,
  ): string | undefined {
    const optionsIn: TryFindArchivatorJsonLocationOptionsInterface =
      options || {}
    const verbose: boolean = optionsIn.showVerbose === true || false
    let currentFolder: string = optionsIn.startingFolder || process.cwd()

    // Look upwards at parent folders until we find a folder containing archivator.json
    for (let i: number = 0; i < 10; ++i) {
      const archivatorJsonFilename: string = join(
        currentFolder,
        'archivator.json',
      )

      if (FileSystem.exists(archivatorJsonFilename)) {
        if (i > 0 && verbose) {
          console.log('Found configuration in ' + archivatorJsonFilename)
        }

        if (verbose) {
          console.log('')
        }

        return archivatorJsonFilename
      }

      const parentFolder: string = dirname(currentFolder)
      if (parentFolder === currentFolder) {
        break
      }

      currentFolder = parentFolder
    }

    return undefined
  }

  /**
   * Looks up a archive in the archivesByName map.
   * If the archive is not found, then undefined is returned.
   */
  public getArchiveByName(
    archiveName: string,
  ): ArchivatorConfigurationArchive | undefined {
    return this._archivesByName.get(archiveName)
  }

  /**
   * Attempts loading archive, if found, returns
   * an IterableIterator of Archivable objects.
   *
   * @generator
   * @yields {Archivable} — An Archivable instance
   */
  *createIterable(archiveName: string): IterableIterator<Archivable> {
    const { archiveFolder } = this.getArchiveByName(archiveName) || {}
    if (!archiveFolder) {
      const message = `No archivator archive found for name ${archiveName}`
      throw new Error(message)
    }
    const archiveIndexFolder = join(this.archivatorJsonFolder, archiveFolder)
    const items = archiveIndexLoader(archiveIndexFolder)
    for (const line of items) {
      try {
        const archivable = Archivable.fromLine(line)
        yield archivable
      } catch (e) {
        // Line is invalid, carry-on
        continue
      }
    }
  }

  /**
   * In order to have an usable archivator archive, each archive directory
   * must have their own "archivator.csv" index file.
   */
  private static ensureValidArchiveFolder(
    archivatorArchiveFolder: string,
  ): void {
    if (!FileSystem.exists(archivatorArchiveFolder)) {
      console.log(`Creating folder: ${archivatorArchiveFolder}`)
      FileSystem.ensureFolder(archivatorArchiveFolder)
      const filePath = join(
        archivatorArchiveFolder,
        ArchivatorConstants.archiveIndexFilename,
      )
      const fileContents =
        `${ArchivableOrderedInputUrlTruncateTuplesFirstLine}` + '\n'
      FileSystem.writeFile(filePath, fileContents)
    }

    for (const filename of FileSystem.readFolder(archivatorArchiveFolder)) {
      const stat: fs.Stats = FileSystem.getLinkStatistics(
        join(archivatorArchiveFolder, filename),
      )

      // Ignore directories, they’re going to be the actual archives
      if (stat.isDirectory()) {
        continue
      }

      // Ignore things that aren't actual files
      if (!stat.isFile() && !stat.isSymbolicLink()) {
        continue
      }

      // Ignore harmless file extensions
      const fileExtension: string = extname(filename)
      if (
        ['.bak', '.disabled', '.md', '.old', '.orig'].indexOf(fileExtension) >=
        0
      ) {
        continue
      }

      /**
       * A list of known config filenames that are expected to appear in an archivator archive folder.
       * To avoid confusion/mistakes, any extra files will be reported as an error.
       */
      const knownAcceptableFiles: string[] = [
        ArchivatorConstants.archiveIndexFilename,
      ]
      const knownSet: Set<string> = new Set<string>(
        knownAcceptableFiles.map(x => x.toUpperCase()),
      )
      if (!knownSet.has(filename.toUpperCase())) {
        throw new Error(
          `An unrecognized file "${filename}" was found in an archivator archive folder:` +
            ` ${archivatorArchiveFolder}`,
        )
      }
    }
  }

  /**
   * The absolute path to the "archivator.json" configuration file that was loaded to construct this object.
   */
  public get archivatorJsonFilename(): string {
    return this._archivatorJsonFilename
  }

  /**
   * The absolute path of the folder that contains "archivator.json" for this archive.
   */
  public get archivatorJsonFolder(): string {
    return this._archivatorJsonFolder
  }

  public get archives(): ArchivatorConfigurationArchive[] {
    return this._archives
  }

  public get archivesByName(): Map<string, ArchivatorConfigurationArchive> {
    return this._archivesByName
  }
}
