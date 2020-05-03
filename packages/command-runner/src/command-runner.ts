/**
 * Node.js CLI command runner.
 *
 * Factored-out from the Excellent RushJS project.
 *
 * Parts of this file are:
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 *
 * Bookmarks:
 * - https://github.com/microsoft/rushstack/blob/%40microsoft/rush-lib_v5.23.2/apps/rush-lib/src/utilities/Utilities.ts
 */
import * as child_process from 'child_process'
import * as os from 'os'
import { Stream } from 'stream'

export interface IEnvironment {
  // NOTE: the process.env doesn't actually support "undefined" as a value.
  // If you try to assign it, it will be converted to the text string "undefined".
  // But this typing is needed for reading values from the dictionary, and for
  // subsets that get combined.
  [environmentVariableName: string]: string | undefined
}

export interface CommandOptionsInterface {
  /**
   * The INIT_CWD environment variable
   */
  initCwd?: string
  /**
   * an existing environment to copy instead of process.env
   */
  initialEnvironment?: IEnvironment
}
export interface ILifecycleCommandOptions<T = {}> {
  /**
   * The rush configuration, if the command is running in a rush repo.
   */
  runtimeConfig: T | undefined
  /**
   * Working directory for running the command
   */
  workingDirectory: string
  /**
   * The folder containing a local .npmrc, which will be used for the INIT_CWD environment variable
   */
  initCwd: string
  /**
   * If true, suppress the process's output, but if there is a nonzero exit code then print stderr
   */
  handleOutput: boolean
}
export class CommandRunner {
  /**
   * Executes the command with the specified command-line parameters, and waits for it to complete.
   * The current directory will be set to the specified workingDirectory.
   */
  public static executeCommand(
    command: string,
    args: string[] = [],
    workingDirectory: string,
    environment?: IEnvironment,
    suppressOutput: boolean = false,
    keepEnvironment: boolean = false,
  ): void {
    CommandRunner._executeCommandInternal(
      command,
      args,
      workingDirectory,
      suppressOutput ? undefined : [0, 1, 2],
      environment,
      keepEnvironment,
    )
  }
  /**
   * Executes the command with the specified command-line parameters, and waits for it to complete.
   * The current directory will be set to the specified workingDirectory.
   */
  public static executeCommandAndCaptureOutput(
    command: string,
    args: string[],
    workingDirectory: string,
    environment?: IEnvironment,
    keepEnvironment: boolean = false,
  ): string {
    const result: child_process.SpawnSyncReturns<
      Buffer
    > = CommandRunner._executeCommandInternal(
      command,
      args,
      workingDirectory,
      ['pipe', 'pipe', 'pipe'],
      environment,
      keepEnvironment,
    )
    return result.stdout.toString()
  }

  /**
   * Attempts to run CommandRunner.executeCommand() up to maxAttempts times before giving up.
   */
  public static executeCommandWithRetry(
    maxAttempts: number,
    command: string,
    args: string[],
    workingDirectory: string,
    environment?: IEnvironment,
    suppressOutput: boolean = false,
    retryCallback?: () => void,
  ): void {
    if (maxAttempts < 1) {
      throw new Error('The maxAttempts parameter cannot be less than 1')
    }
    let attemptNumber: number = 1
    for (;;) {
      try {
        CommandRunner.executeCommand(
          command,
          args,
          workingDirectory,
          environment,
          suppressOutput,
        )
      } catch (error) {
        console.log(os.EOL + 'The command failed:')
        console.log(` ${command} ` + args.join(' '))
        console.log(`ERROR: ${error.toString()}`)
        if (attemptNumber < maxAttempts) {
          ++attemptNumber
          console.log(`Trying again (attempt #${attemptNumber})...` + os.EOL)
          if (retryCallback) {
            retryCallback()
          }
          continue
        } else {
          console.error(`Giving up after ${attemptNumber} attempts` + os.EOL)
          throw error
        }
      }
      break
    }
  }

  /**
   * Executes the command with the specified command-line parameters, and waits for it to complete.
   * The current directory will be set to the specified workingDirectory.
   */
  private static _executeCommandInternal(
    command: string,
    args: string[],
    workingDirectory: string,
    stdio:
      | 'pipe'
      | 'ignore'
      | 'inherit'
      | (
          | number
          | 'pipe'
          | 'ignore'
          | 'inherit'
          | 'ipc'
          | Stream
          | null
          | undefined)[]
      | undefined,
    environment?: IEnvironment,
    keepEnvironment: boolean = false,
  ): child_process.SpawnSyncReturns<Buffer> {
    const options: child_process.SpawnSyncOptions = {
      cwd: workingDirectory,
      shell: true,
      stdio: stdio,
      env: keepEnvironment
        ? environment
        : CommandRunner._createEnvironmentForCommand({
            initialEnvironment: environment,
          }),
    }
    // This is needed since we specify shell=true below.
    // NOTE: On Windows if we escape "NPM", the spawnSync() function runs something like this:
    //   [ 'C:\\Windows\\system32\\cmd.exe', '/s', '/c', '""NPM" "install""' ]
    //
    // Due to a bug with Windows cmd.exe, the npm.cmd batch file's "%~dp0" variable will
    // return the current working directory instead of the batch file's directory.
    // The workaround is to not escape, npm, i.e. do this instead:
    //   [ 'C:\\Windows\\system32\\cmd.exe', '/s', '/c', '"npm "install""' ]
    //
    // We will come up with a better solution for this when we promote executeCommand()
    // into node-core-library, but for now this hack will unblock people:
    // Only escape the command if it actually contains spaces:
    const escapedCommand: string =
      command.indexOf(' ') < 0
        ? command
        : CommandRunner.escapeShellParameter(command)
    const escapedArgs: string[] = args.map(x =>
      CommandRunner.escapeShellParameter(x),
    )
    let result: child_process.SpawnSyncReturns<
      Buffer
    > = child_process.spawnSync(escapedCommand, escapedArgs, options)
    if (result.error && (result.error as any).errno === 'ENOENT') {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      // This is a workaround for GitHub issue #25330
      // https://github.com/nodejs/node-v0.x-archive/issues/25330
      result = child_process.spawnSync(command + '.cmd', args, options)
    }
    CommandRunner._processResult(result)
    return result
  }
  /**
   * Returns a process.env environment suitable for executing lifecycle scripts.
   * @param initialEnvironment - an existing environment to copy instead of process.env
   */
  private static _createEnvironmentForCommand(
    options: CommandOptionsInterface,
  ): IEnvironment {
    if (options.initialEnvironment === undefined) {
      options.initialEnvironment = process.env
    }
    const environment: IEnvironment = {}
    for (const key of Object.getOwnPropertyNames(options.initialEnvironment)) {
      const normalizedKey: string =
        os.platform() === 'win32' ? key.toUpperCase() : key
      // If Rush itself was invoked inside a lifecycle script, this may be set and would interfere
      // with Rush's installations.  If we actually want it, we will set it explicitly below.
      if (normalizedKey === 'INIT_CWD') {
        continue
      }
      // When NPM invokes a lifecycle event, it copies its entire configuration into environment
      // variables.  Rush is supposed to be a deterministic controlled environment, so don't bring
      // this along.
      //
      // NOTE: Longer term we should clean out the entire environment and use rush.json to bring
      // back specific environment variables that the repo maintainer has determined to be safe.
      if (normalizedKey.match(/^NPM_CONFIG_/)) {
        continue
      }
      // Use the uppercased environment variable name on Windows because environment variable names
      // are case-insensitive on Windows
      environment[normalizedKey] = options.initialEnvironment[key] as string
    }
    // When NPM invokes a lifecycle script, it sets an environment variable INIT_CWD that remembers
    // the directory that NPM started in.  This allows naive scripts to change their current working directory
    // and invoke NPM operations, while still be able to find a local .npmrc file.  Although Rush recommends
    // for toolchain scripts to be professionally written (versus brittle stuff like
    // "cd ./lib && npm run tsc && cd .."), we support INIT_CWD for compatibility.
    //
    // More about this feature: https://github.com/npm/npm/pull/12356
    if (options.initCwd) {
      environment['INIT_CWD'] = options.initCwd // eslint-disable-line dot-notation
    }
    return environment
  }
  /**
   * For strings passed to a shell command, this adds appropriate escaping
   * to avoid misinterpretation of spaces or special characters.
   *
   * Example: 'hello there' --> '"hello there"'
   */
  public static escapeShellParameter(parameter: string): string {
    return `"${parameter}"`
  }
  private static _processResult(
    result: child_process.SpawnSyncReturns<Buffer>,
  ): void {
    if (result.error) {
      result.error.message +=
        os.EOL + (result.stderr ? result.stderr.toString() + os.EOL : '')
      throw result.error
    }
    if (result.status) {
      throw new Error(
        'The command failed with exit code ' +
          result.status +
          os.EOL +
          (result.stderr ? result.stderr.toString() : ''),
      )
    }
  }

  // @ts-ignore
  private static _executeLifecycleCommandInternal<TCommandResult>(
    command: string,
    spawnFunction: (
      command: string,
      args: string[],
      spawnOptions: child_process.SpawnOptions,
    ) => TCommandResult,
    options: ILifecycleCommandOptions,
  ): TCommandResult {
    let shellCommand: string = process.env.comspec || 'cmd'
    let commandFlags: string = '/d /s /c'
    let useShell: boolean = true
    if (process.platform !== 'win32') {
      shellCommand = 'sh'
      commandFlags = '-c'
      useShell = false
    }
    const environment: IEnvironment = CommandRunner._createEnvironmentForCommand(
      options,
    )
    return spawnFunction(shellCommand, [commandFlags, command], {
      cwd: options.workingDirectory,
      shell: useShell,
      env: environment,
      stdio: options.handleOutput ? ['pipe', 'pipe', 'pipe'] : [0, 1, 2],
    })
  }
}
