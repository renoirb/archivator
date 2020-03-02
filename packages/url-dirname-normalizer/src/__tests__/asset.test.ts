/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { getHashes } from 'crypto'

import { fixtures } from '.'
import { createHashFunction } from '../hashing'
import { NormalizedAsset, assetCollectionNormalizer } from '..'

describe('NormalizedAsset', () => {
  test('Happy-Path', () => {
    /**
     * Imagine we have an HTML document with URL http://www.example.org/a/
     * With an image tag `<img src="b/c.png" />` (our "asset", below)
     */
    const sourceDocument = 'http://www.example.org/a/'
    const imgSrc = 'b/c.png'

    // Expected outcome
    const src = 'http://www.example.org/a/b/c.png'
    const reference = '4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png'
    const subject = new NormalizedAsset(sourceDocument, imgSrc)
    expect(subject).toMatchObject({ src, reference })
    // console.log('run', { sourceDocument, imgSrc, src, reference, asset: subject })
  })

  const assetsNormalizationFixtures = fixtures.load('assets.json')
  const hash = 'sha1'
  // @ts-ignore
  test.each(assetsNormalizationFixtures)(
    `%s:\n\thash:\t\t\t${hash}\n\tsrc:\t\t\t%s\n\texpected:\t\t%s\n\treason:\t\t\t%s\n\tduration:\t\t`,
    (sourceDocument, src, expected) => {
      const subject = new NormalizedAsset(sourceDocument, src, hash)
      // console.log('assets.json run', {sourceDocument, src, expected, reason: _, asset: subject})
      expect(subject).toHaveProperty('src', expected)
      expect(subject).toHaveProperty('reference')
      expect(subject).toMatchSnapshot()
    },
  )

  const resourceUrl = 'http://example.org/a/b.png'
  // @ts-ignore
  test.skip.each(getHashes())(`${resourceUrl} hashed in %s`, hash => {
    const hashed = createHashFunction(hash, 'hex')(resourceUrl)
    // expect(hashed).toMatchSnapshot()
    console.log('getHashes run', { resourceUrl, hash, hashed })
  })
})

describe('assetCollectionNormalizer', () => {
  const sourceDocument = 'http://renoirboulanger.com/page/3/'
  const matches = [
    // Case 1: Fully qualified URL that is local to the site
    'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
    // Case 2: Fully qualified URL that is outside
    'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
    // Case 3: Fully qualified  URL that is outside and protocol relative
    '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
    // Case 4: Relative URL to the domain name, starting at root
    '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
    // Case 5: Relative URL to the current source document
    '../../avatar.jpg',
  ]
  test('Happy-Path', () => {
    const normalized = assetCollectionNormalizer(
      sourceDocument,
      matches,
      'sha1',
    )
    // @ts-ignore
    expect([...normalized]).toMatchSnapshot()
  })
})
