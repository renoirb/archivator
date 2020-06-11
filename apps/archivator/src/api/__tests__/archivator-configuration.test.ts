import * as path from 'path'

import { ArchivatorConfiguration } from '..'

describe('ArchivatorConfiguration', () => {
  const configFile: string = path.resolve(
    __dirname,
    'sample-repo',
    'archivator.json',
  )

  let _oldEnv: typeof process.env

  beforeEach(() => {
    _oldEnv = process.env
    process.env = {}
  })

  afterEach(() => {
    process.env = _oldEnv
  })

  it('can load configuration using loadFromConfigurationFile', (done: jest.DoneCallback) => {
    expect(() => {
      ArchivatorConfiguration.loadFromConfigurationFile(configFile)
    }).not.toThrow()

    done()
  })

  it('is possible to get enumeration of archives', (done: jest.DoneCallback) => {
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
    const subject = ArchivatorConfiguration.loadFromConfigurationFile(
      configFile,
    )

    const archiveData = subject.getArchiveByName('paleo-recipes')
    expect(archiveData).toMatchSnapshot()

    done()
  })

  it('is possible to get archive CSV lines by asking createIterable', (done: jest.DoneCallback) => {
    const subject = ArchivatorConfiguration.loadFromConfigurationFile(
      configFile,
    )

    const archiveIndexLines = subject.createIterable('research-papers')
    const collection = [...archiveIndexLines]
    expect(collection).toMatchSnapshot()

    done()
  })
})
