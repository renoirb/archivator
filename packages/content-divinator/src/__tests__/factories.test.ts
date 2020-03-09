/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { factories } from '../factories'

import { fixtures } from '.'

describe('utils', () => {
  test('factories', () => {
    const subject = factories.divinator('english', ['en-IN'])
    expect(subject).toMatchSnapshot()
    const textContent = fixtures.loadText('article-charlie.txt')
    const textMap = subject.words(textContent)
    expect(textMap).toMatchSnapshot()
  })
})
