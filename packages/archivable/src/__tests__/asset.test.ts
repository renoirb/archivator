/* eslint-env jest */

import {
  createHashFunction,
  getHashes,
  CryptoCommonHashingFunctions,
} from '../crypto'
import {
  assetReferenceHandlerFactory,
  createNormalizedAssetReferenceMap,
  DocumentAssets,
  extractNormalizedAssetDest,
  assetFileExtensionNormalizer,
  NormalizedAsset,
} from '..'

import { fixtures } from '.'

/**
 * The string "http://www.example.org/a/b/c.png" encoded in Hexadecimal, hashing as...
 *
 * {@link CryptoCommonHashingFunctions}
 */
type ExampleSameReferenceHashes = Extract<
  'sha1' | 'mdc2' | 'md5' | 'sha512' | 'sha224',
  CryptoCommonHashingFunctions
>
const sameReferenceDifferentHash: Record<ExampleSameReferenceHashes, string> = {
  sha1: '4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png',
  mdc2: '0c6a93f9d825332c4a9a74e31730690c.png',
  md5: '6a324cd1a0e4e480c4db3e0558360527.png',
  sha512:
    '038cfb9ef4324be8ef490dc2fb3b1807f775afff693202bf7823e842aa5168612a441132bac051f90f6fcb59942324826d5885370e4dbe8465baa915aa1b6382.png',
  sha224: '6291f0c9dac71cbbb9ebbfe09a560c204aff4e9cbdd913eda3dfef21.png',
}

describe('NormalizedAsset', () => {
  test('Happy-Path', () => {
    // Just so one can toggle this once, for sanity.
    const localTestHashName: ExampleSameReferenceHashes = 'md5'

    /**
     * Imagine we have an HTML document with URL http://www.example.org/a/
     * With an image tag `<img src="b/c.png" />` (our "asset", below)
     *
     * Which should make 'b/c.png' from 'http://www.example.org/a/' to be 'http://www.example.org/a/b/c.png'
     * That's what "src" should refer to.
     */
    const sourceDocument = 'http://www.example.org/a/'
    const match = 'b/c.png'
    const src = 'http://www.example.org/a/b/c.png' // sourceDocument + match

    const subject = new NormalizedAsset(sourceDocument, match)
    expect(subject).toMatchObject({ src, match })
    expect(subject).toMatchSnapshot()

    // BEGIN Separate concerns of reference from NormalizedAssetType
    const referenceHandler = assetReferenceHandlerFactory(
      createHashFunction(localTestHashName, 'hex'),
      assetFileExtensionNormalizer,
    )
    // END Separate concerns...

    const extractedAssetReference = referenceHandler(subject)
    expect(extractedAssetReference).toMatchSnapshot()
    expect(extractedAssetReference).toMatchObject({
      reference: sameReferenceDifferentHash[localTestHashName],
    })

    expect(() => extractNormalizedAssetDest(subject, sourceDocument)).toThrow(
      'Missing asset reference, make sure you’ve used assetReferenceHandlerFactory before using extractNormalizedAssetDest.',
    )

    /**
     * Make sure above throws ^ so we can avoid bugs later own below
     * Separate concerns of where to store file from NormalizedAssetType.
     *
     * extractNormalizedAssetDest works on merged object, since we're separating concerns
     * from NormalizedAsset and what should be the reference and dest value.
     * We’re merging it manually here.
     */
    const manuallyMergedSubject = Object.assign(
      {},
      { ...subject, ...extractedAssetReference },
    )
    expect(manuallyMergedSubject).toHaveProperty(
      'reference',
      sameReferenceDifferentHash[localTestHashName],
    )

    const extractedAssetDest = extractNormalizedAssetDest(
      manuallyMergedSubject,
      sourceDocument,
    )
    expect(extractedAssetDest).toMatchObject({
      dest: 'example.org/a/' + sameReferenceDifferentHash[localTestHashName],
    })

    // console.log('run', {
    //   sourceDocument,
    //   match,
    //   src,
    //   reference,
    //   asset: subject,
    // })
  })

  const hash = 'sha1'
  test.each(fixtures.loadNormalizedAssetAlphaJsonFixture())(
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

  const resourceUrl = 'http://www.example.org/a/b/c.png'
  // @ts-ignore
  test.skip.each(getHashes())(`${resourceUrl} hashed in %s`, (hash) => {
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
    const matches = ['//www.example.org/a/b/c.png']
    const subject = new DocumentAssets(sourceDocument, matches)
    // @ts-ignore
    const arrayified = [...subject]
    expect(arrayified).toMatchSnapshot()
    // Just sanity-check, since we **DO NOT CALL** DocumentAssets.setReferenceHandler(), it should default sha1 in hex
    expect(arrayified[0]).toHaveProperty(
      'reference',
      sameReferenceDifferentHash.sha1,
    )
  })

  test('setReferenceHandler', () => {
    const sourceDocument =
      'http://blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path'
    const matches = ['//www.example.org/a/b/c.png']
    const subject = new DocumentAssets(sourceDocument, matches)

    // BEGIN Separate concerns of reference from NormalizedAssetType
    const referenceHandler = assetReferenceHandlerFactory(
      createHashFunction('md5', 'hex'),
      assetFileExtensionNormalizer,
    )
    subject.setReferenceHandler(referenceHandler)
    // END BEGIN Separate concerns...

    // @ts-ignore
    const arrayified = [...subject]
    expect(arrayified).toMatchSnapshot()
    // Just sanity-check, since we **DO CALL** DocumentAssets.setReferenceHandler()
    expect(arrayified[0]).toHaveProperty(
      'reference',
      sameReferenceDifferentHash.md5,
    )
  })
})

describe('createNormalizedAssetReferenceMap', () => {
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
    const subject = createNormalizedAssetReferenceMap(collection)
    expect(subject).toMatchSnapshot()
  })
})
