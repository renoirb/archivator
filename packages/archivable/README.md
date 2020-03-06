# [@archivator/archivable][repo-url]

> Archivable Data Transfer Object and NormalizedAsset Entities for archiving web pages and their assets

A _Data Transfer Object_ (or _Entity_ object) and related utilities to manipulate Web Page Metadata while archiving.

[repo-url]: https://github.com/renoirb/archivator/blob/re-rework/packages/archivable 'Archivable Data Transfer Object'

| Version                                                                                                                                                                | Size                                                                                                 | Dependencies                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm](https://img.shields.io/npm/v/@archivator/archivable?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/@archivator/archivable) | ![npm bundle size](https://img.shields.io/bundlephobia/min/@archivator/archivable?style=flat-square) | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/@archivator/archivable?style=flat-square&logo=appveyor&logo=dependabot) |

## Usage

### Archivable

```js
import { Archivable } from '@archivator/archivable'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510'

const selector = '#main'
const truncate = '.ad,.sponsor'

/** @type {import('@archivator/archivable').ArchivableType} */
const dto = new Archivable(sourceDocument, selector, truncate)
// ... Do things with `dto`
```

When using CSV format

```js
import { Archivable } from '@archivator/archivable'

// The following lines would be from a text file where we have one item per line
// Each item MUST have two semi-columns
const lines = [
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510;#main;.ad,.sponsor',
]

for (const line of lines) {
  /** @type {import('@archivator/archivable').ArchivableType} */
  const dto = Archivable.fromLine(line)
  // ... Do things with `dto`
}
```

### DocumentAssets and NormalizedAsset

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
import {
  DocumentAssets,
  NormalizedAsset,
  createHashFunction,
} from '@archivator/archivable'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path'

// Image tag src attribute value, e.g. `<img src="//example.org/a/b.png" />`
// Notice we used protocol relative URL
// (i.e. not specify https, meaning we'll use from source document)
const assetUrl = '//www.example.org/a/b/c.png'

/**
 * `normalized` is an instance of `NormalizedAsset`, and should look like this
 *
 * ```json
 * {
 *   "dest": null,
 *   "match": "//www.example.org/a/b/c.png",
 *   "reference": null,
 *   "src": "http://www.example.org/a/b/c.png",
 * }
 * ```
 *
 * @type {import('@archivator/archivable').NormalizedAsset}
 */
const normalized = new NormalizedAsset(sourceDocument, assetUrl)

/**
 * If you want more than one NormalizedAsset; Along with a dest and reference non null.
 * Leverage DocumentAssets instead.
 */
const matches = [assetUrl]

/**
 * To do this, pass all assets as an array of strings (like above)
 * Then, pass them to `DocumentAssets` as constructor arguments
 *
 * @type {Iterable<import('@archivator/archivable').NormalizedAssetType>}
 */
const collection = new DocumentAssets(sourceDocument, matches)

// And we can iterate over the collection
for (const normalized of collection) {
  /**
   * `normalized` is an instance of `NormalizedAssetType`, and should look like this
   *
   * Notice "4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97" is sha1 of "http://www.example.org/a/b/c.png".
   * It is configurable, see below.
   *
   * ```json
   * {
   *   "dest": "blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path/4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png",
   *   "match": "//www.example.org/a/b/c.png",
   *   "reference": "4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png",
   *   "src": "http://www.example.org/a/b/c.png",
   * }
   * ```
   */
  console.log(normalized)
}
````

If you want to change hashing function type, you can do by using `DocumentAssets.setReferenceHandler(HashingFunctionType, NormalizedAssetFileExtensionExtractorType)`

```typescript
// ... Continuing from example above
import {
  HashingFunctionType,
  createHashFunction,
  NormalizedAssetFileExtensionExtractorType,
} from '@archivator/archivable'

// One can set its own hash function
// As long as the returned createHashFunction is of type `(msg: string) => string`
const hasher: HashingFunctionType = createHashFunction('md5', 'hex')

/**
 * One can set their own normalizer, as long as it of type `(file: string) => string`
 * When the output is either an empty string, or a file extension prefixed by a dot (e.g. `.png`)
 *
 * In the example below, in every case, the file extension would ALWAYS be ".foo".
 * Not really useful, instead use {@link assetFileExtensionNormalizer}.
 *
 * But we can later-on replace that function after validating the mime-type.
 */
const extensionNormalizer: NormalizedAssetFileExtensionExtractorType = (
  foo: string,
): string => `.foo`

collection.setReferenceHandler(
  assetReferenceHandlerFactory(hasher, extensionNormalizer),
)
```

The above example's md5 for 'http://www.example.org/a/b/c.png' would then be

> 6a324cd1a0e4e480c4db3e0558360527

Iterating over the same `collection` would look like this

```json
[
  {
    "dest": "blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path/6a324cd1a0e4e480c4db3e0558360527.png",
    "match": "//example.org/a/b.png",
    "reference": "6a324cd1a0e4e480c4db3e0558360527.png",
    "src": "http://www.example.org/a/b/c.png"
  }
]
```

### DocumentAssets

When we have more than one asset to download, we might have a list of assets, and we want to get an iterable collection of NormalizedAsset

````js
import { DocumentAssets } from '@archivator/archivable'

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
 * Leverage ECMAScript 2015+ Iteration prototocol.
 *
 * Pass a collection of strings, get a normalized list with iteration.
 *
 * Each item in collection should look like this;
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
 * @type {Iterable<import('@archivator/archivable').NormalizedAssetType>}
 */
const collection = new DocumentAssets(sourceDocument, matches)
for (const normalized of collection) {
  // It is a generator function, we can iterate normalized like an array.
  // If we were in an asychronous function, we'd be able to await each step.
  // In this example, we're simply using the return of assetCollectionNormalizer like we would with an array.
  console.log(normalized)
}
````
