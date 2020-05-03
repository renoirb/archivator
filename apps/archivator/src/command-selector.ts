/**
 * Which Project command to run
 *
 * Bookmarks:
 * - https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush/src/RushCommandSelector.ts
 */
import * as path from 'path'

// import { CommandRunner } from '@archivator/command-runner'

type CommandName = 'archive' | 'UNSUPPORTED'
const VALID_COMMAND_NAMES: CommandName[] = ['archive']

export class CommandSelector {
  public static execute(): void {
    const command = CommandSelector._getCommandName()
    /**
     * UNFINISHED
     * - Find way to load only matching command
     *
     * Something like this:
     * - https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush/src/RushCommandSelector.ts#L27
     * - https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/api/Rush.ts#L53
     */
    CommandSelector._failWithError(`STUB ${command}`)
  }
  private static _getCommandName(): CommandName {
    let input = ''
    if (process.argv.length >= 2) {
      // Example:
      // argv[0]: "C:\\Program Files\\nodejs\\node.exe"
      // argv[1]: "C:\\Program Files\\nodejs\\node_modules\\@microsoft\\rush\\bin\\rushx"
      const basename: string = path.basename(process.argv[1]).toUpperCase()
      if (typeof basename === 'string' && basename !== '') {
        input = basename.toLowerCase()
      }
    }
    const picked = VALID_COMMAND_NAMES.filter(i => input === i)
    return picked.length === 1 ? picked[0] : 'UNSUPPORTED'
  }
  private static _failWithError(message: string): never {
    console.log(message)
    return process.exit(1)
  }
}
