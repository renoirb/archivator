/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { getHashes } from 'crypto'

import { fixtures } from '.'
import { createHashFunction } from '../hashing'
import {
  NormalizedAsset,
  DocumentAssets,
  extractNormalizedAssetReference,
  extractNormalizedAssetDest,
} from '..'

describe('NormalizedAsset', () => {
  test('Happy-Path', () => {
    /**
     * Imagine we have an HTML document with URL http://www.example.org/a/
     * With an image tag `<img src="b/c.png" />` (our "asset", below)
     */
    const sourceDocument = 'http://www.example.org/a/'
    const match = 'b/c.png'

    const src = 'http://www.example.org/a/b/c.png'
    const subject = new NormalizedAsset(sourceDocument, match)
    expect(subject).toMatchObject({ src, match })

    // Separate concerns of reference from NormalizedAssetType.
    const extractedAssetReference = extractNormalizedAssetReference(
      subject,
      createHashFunction('sha1', 'hex'),
    )
    expect(extractedAssetReference).toMatchObject({
      reference: '4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png',
    })

    expect(() => extractNormalizedAssetDest(subject, sourceDocument)).toThrow(
      'Missing asset reference, make sure you’ve used extractNormalizedAssetReference before using extractNormalizedAssetDest.',
    )
    // Make sure above throws ^ so we can avoid bugs later own below
    // Separate concerns of where to store file from NormalizedAssetType.
    const extractedAssetDest = extractNormalizedAssetDest(
      // Yeah, this one requires that other one. Not that good. Improve?
      Object.assign({}, { ...subject, ...extractedAssetReference }),
      sourceDocument,
    )
    expect(extractedAssetDest).toMatchObject({
      dest: 'example.org/a/4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png',
    })

    // console.log('run', {
    //   sourceDocument,
    //   match,
    //   src,
    //   reference,
    //   asset: subject,
    // })
  })

  const assetsNormalizationFixtures = fixtures.load('assets.json')
  const hash = 'sha1'
  // @ts-ignore
  test.each(assetsNormalizationFixtures)(
    `%s:\n\thash:\t\t\t${hash}\n\tsrc:\t\t\t%s\n\texpected:\t\t%s\n\treason:\t\t\t%s\n\tduration:\t\t`,
    (sourceDocument, src, expected) => {
      const subject = new NormalizedAsset(sourceDocument, src)
      // console.log('assets.json run', {sourceDocument, src, expected, reason: _, asset: subject})
      expect(subject).toMatchSnapshot()
      expect(subject).toHaveProperty('src', expected)
      expect(subject).toHaveProperty('match', src)
      // Those below should be handled separately
      expect(subject).toHaveProperty('reference', null)
      expect(subject).toHaveProperty('dest', null)
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

describe('DocumentAssets', () => {
  test('Happy-Path', () => {
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
    const collection = new DocumentAssets(sourceDocument, matches)
    // @ts-ignore
    const arrayified = [...collection]
    expect(arrayified).toMatchSnapshot()
  })
  test('Documentation examples', () => {
    const sourceDocument =
      'http://blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path'
    const matches = ['//example.org/a/b.png']
    const collection = new DocumentAssets(sourceDocument, matches)
    collection.setHasherParams('sha512', 'hex')
    // @ts-ignore
    const arrayified = [...collection]
    expect(arrayified).toMatchSnapshot()
  })
})
