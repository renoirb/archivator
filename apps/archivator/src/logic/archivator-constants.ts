/**
 * Constants used by archivator.
 */
export class ArchivatorConstants {
  /**
   * The filename ("archivator.csv") is where we keep bookmark URLs,
   * one per line from which we iterate when archiving or processing.
   * Since we might want to have more than one archive, the
   * directory name would be used as a way to regroup different
   * archive categories. For each archive, there MUST be this
   * file present.
   */
  public static readonly archiveIndexFilename: string = 'archivator.csv'
}
