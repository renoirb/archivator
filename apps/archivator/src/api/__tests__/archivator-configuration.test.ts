import * as path from 'path'

import { ArchivatorConfiguration } from '..'

describe('ArchivatorConfiguration', () => {
  let _oldEnv: typeof process.env

  beforeEach(() => {
    _oldEnv = process.env
    process.env = {}
  })

  afterEach(() => {
    process.env = _oldEnv
  })

  it('can load configuration using loadFromConfigurationFile', (done: jest.DoneCallback) => {
    const configFile: string = path.resolve(
      __dirname,
      'sample-repo',
      'archivator.json',
    )

    expect(() => {
      ArchivatorConfiguration.loadFromConfigurationFile(configFile)
    }).not.toThrow()

    done()
  })

  it('is possible to get enumeration of archives', (done: jest.DoneCallback) => {
    const configFile: string = path.resolve(
      __dirname,
      'sample-repo',
      'archivator.json',
    )
    const subject = ArchivatorConfiguration.loadFromConfigurationFile(
      configFile,
    )

    expect(subject).toHaveProperty('archives')
    expect(subject.archives).toMatchSnapshot()
    expect(subject).toHaveProperty('archivesByName')
    expect(subject.archivesByName).toMatchSnapshot()

    done()
  })

  it('is possible to get one archive by asking getArchiveByName', (done: jest.DoneCallback) => {
    const configFile: string = path.resolve(
      __dirname,
      'sample-repo',
      'archivator.json',
    )
    const subject = ArchivatorConfiguration.loadFromConfigurationFile(
      configFile,
    )

    const archiveData = subject.getArchiveByName('paleo-recipes')
    expect(archiveData).toMatchSnapshot()

    done()
  })

  it('is possible to get archive CSV lines by asking getArchiveIndex', (done: jest.DoneCallback) => {
    const configFile: string = path.resolve(
      __dirname,
      'sample-repo',
      'archivator.json',
    )
    const subject = ArchivatorConfiguration.loadFromConfigurationFile(
      configFile,
    )

    const archiveIndexLines = subject.getArchiveIndex('research-papers')
    expect(archiveIndexLines).toMatchSnapshot()

    done()
  })
})
