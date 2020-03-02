# [url-dirname-normalizer](https://github.com/renoirb/archivator/blob/re-rework/packages/url-dirname-normalizer)

Normalize URLs to be valid filesystem paths for archiving web pages and their assets

| Version                                                                                                                                                                | Size                                                                                                 | Dependencies                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm](https://img.shields.io/npm/v/url-dirname-normalizer?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/url-dirname-normalizer) | ![npm bundle size](https://img.shields.io/bundlephobia/min/url-dirname-normalizer?style=flat-square) | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/url-dirname-normalizer?style=flat-square&logo=appveyor&logo=dependabot) |

## Usage

### directoryNameNormalizer

```js
import { directoryNameNormalizer } from 'url-dirname-normalizer'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510'

/**
 * Filesystem path where to write files to
 */
directoryNameNormalizer(sourceDocument)
// > "example.org/ausername/some-lengthy-string-ending-with-a-hash"
```

### NormalizedAsset

While archiving a web page, we might have a list of all assets the document makes references to.
They can be embedded inside `<img src="...">` tags and other similar schemes.

Each "NormalizedAsset" is an entity from which we can figure out where an asset can be downloaded in relation
to the current source document URL, like web browsers do.

NormalizedAsset contains:

- `match`: is the initial value passed in, that can be useful if we want to rewrite the source document
- `reference`: is the normalized hash for the asset, we could use that value to replace the source document's HTML with a local name
- `dest`: would be where we would archive the asset, it is basically `directoryNameNormalizer(sourceDocument) + reference`
- `src`: is where we should attempt downloading the asset from

````js
import { NormalizedAsset } from 'url-dirname-normalizer'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path'

// Image tag src attribute value, e.g. `<img src="//example.org/a/b.png" />`
// Notice we used protocol relative URL
// (i.e. not specify https, meaning we'll use from source document)
const imgSrc = '//example.org/a/b.png'

/**
 * Create a reference factory so we can resolve the URL based on that document URL
 *
 * Should look like this
 *
 * ```json
 * {
 *   "dest": "blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path/e359b9cb7fdfc9072f27cdb1352d919c2cbbc3e6.png",
 *   "match": "//example.org/a/b.png",
 *   "reference": "e359b9cb7fdfc9072f27cdb1352d919c2cbbc3e6.png",
 *   "src": "http://example.org/a/b.png",
 * }
 * ```
 *
 * @type {import('url-dirname-normalizer').NormalizedAsset}
 */
const asset = new NormalizedAsset(sourceDocument, imgSrc)
````

### assetCollectionNormalizer

When we have more than one asset to download, we might have a list of assets, and we want to get an iterable collection of NormalizedAsset

````js
import { assetCollectionNormalizer } from 'url-dirname-normalizer'

// HTML Source document URL from where the asset is embedded
const sourceDocument = 'http://renoirboulanger.com/page/3/'

// List of URLs you might find on that URL
// e.g. `<img src="//example.org/a/b.png" />`
// Notice some URLs are relative, protocol-relative, others are going on another domain
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

/**
 * Get a normalized list
 *
 * Should look like this
 *
 * ```json
 * [
 *    {
 *      "dest": "renoirboulanger.com/page/3/430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg",
 *      "match": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *      "reference": "430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg",
 *      "src": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *    },
 *    {
 *      "dest": "renoirboulanger.com/page/3/b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png",
 *      "match": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *      "reference": "b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png",
 *      "src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *    },
 *    {
 *      "dest": "renoirboulanger.com/page/3/63dc122dfd3c702e12714fbe4ba744e463c49edb",
 *      "match": "//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *      "reference": "63dc122dfd3c702e12714fbe4ba744e463c49edb",
 *      "src": "http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *    },
 *    {
 *      "dest": "renoirboulanger.com/page/3/840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg",
 *      "match": "/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *      "reference": "840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg",
 *      "src": "http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *    },
 *    {
 *      "dest": "renoirboulanger.com/page/3/37fd63a34f42ed3b012b9baac82e97fbe9f9c067.jpg",
 *      "match": "../../avatar.jpg",
 *      "reference": "37fd63a34f42ed3b012b9baac82e97fbe9f9c067.jpg",
 *      "src": "http://renoirboulanger.com/avatar.jpg",
 *    },
 * ]
 * ```
 *
 * @type {IterableIterator<import('url-dirname-normalizer').NormalizedAsset>}
 */
const normalized = assetCollectionNormalizer(sourceDocument, matches, 'sha1')
for (const asset of normalized) {
  // It is a generator function, we can iterate normalized like an array.
  // If we were in an asychronous function, we'd be able to await each step.
  // In this example, we're simply using the return of assetCollectionNormalizer like we would with an array.
  console.log(asset)
}
````
