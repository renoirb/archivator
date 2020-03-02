import { getHashes } from 'crypto'

import { fixtures } from '.'
import { NormalizedAsset, createHashFunction } from '../internal'
import { assetCollectionNormalizer } from '..'

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
    const reference =
      'ce8dff8b4f0b2e1baabc24c913faee8fd80eff35b93a28f62d5d83fecbaf6983.png'
    const subject = new NormalizedAsset(sourceDocument, imgSrc)
    expect(subject).toMatchObject({ src, reference })
    console.log('run', { sourceDocument, imgSrc, src, reference, asset: subject })
  })

  const assetsNormalizationFixtures = fixtures.load('assets.json')
  const hash = 'RSA-MD4'
  test.each(assetsNormalizationFixtures)(
    `%s:\n\thash:\t\t\t\t${hash}\n\tsrc:\t\t\t\t%s\n\texpected:\t\t%s\n\treason:\t\t\t%s\n\tduration:\t\t`,
    (sourceDocument, src, expected, _) => {
      const subject = new NormalizedAsset(sourceDocument, src, hash)
      // console.log('assets.json run', {sourceDocument, src, expected, reason: _, asset: subject})
      expect(subject).toHaveProperty('src', expected)
      expect(subject).toHaveProperty('reference')
      expect(subject).toMatchSnapshot()
    },
  )

  const resourceUrl = 'http://example.org/a/b.png'
  test.skip.each(getHashes())(`${resourceUrl} hashed in %s`, hash => {
    const hashed = createHashFunction(hash, 'hex')(resourceUrl)
    // expect(hashed).toMatchSnapshot()
    console.log('getHashes run', { resourceUrl, hash, hashed })
  })
})

describe('assetCollectionNormalizer', () => {
  const sourceDocument = 'http://renoirboulanger.com/page/3/'
  const matches = [
    'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
    'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
    'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
    '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
    '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
  ]
  test('Happy-Path', () => {
    const normalized = assetCollectionNormalizer(sourceDocument, matches, 'sha1')
    expect([...normalized]).toMatchSnapshot()
  })
})
