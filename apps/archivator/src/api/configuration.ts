/**
 * This represents the configuration of an archive collection
 * that is managed by Archivator, based on the archivator.json
 * configuration file.
 * @public
 */
export class ArchivatorConfigurationArchiveJson {
  archiveName: string
  archiveFolder: string
}

/**
 * This represents the JSON data structure for the "archivator.json"
 * configuration file.
 *
 * See archivator.schema.json for documentation.
 */
export interface ArchivatorConfigurationJsonInterface {
  $schema: string
  archives: ArchivatorConfigurationArchiveJson[]
}

/**
 * Options for `RushConfiguration.tryFindRushJsonLocation`.
 * @public
 */
export interface TryFindArchivatorJsonLocationOptionsInterface {
  /**
   * Be more verbose about how to seek for archivator.json configuration.
   */
  showVerbose?: true
  /**
   * The folder path where the search will start.
   * Defaults to the current working directory.
   */
  startingFolder?: string
}
