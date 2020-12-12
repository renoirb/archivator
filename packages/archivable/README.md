# [@archivator/archivable][repo-url]

> Archivable Data Transfer Object and NormalizedAsset Entities for archiving web pages and their assets

A _Data Transfer Object_ (or _Entity_ object) and related utilities to manipulate Web Page Metadata while archiving.

[repo-url]: https://github.com/renoirb/archivator/blob/v3.x-dev/packages/archivable 'Archivable Data Transfer Object'
[npmjs-package-badge]: https://img.shields.io/npm/v/%40archivator%2Farchivable?style=flat-square&logo=appveyor&label=npm&logo=npm
[npmjs-package]: https://www.npmjs.com/package/%40archivator%2Farchivable
[bundlesize-badge]: https://img.shields.io/bundlephobia/min/%40archivator%2Farchivable?style=flat-square
[dependabot-badge]: https://img.shields.io/librariesio/release/npm/%40archivator%2Farchivable?style=flat-square&logo=appveyor&logo=dependabot

| Version                                                                                                                                                                        | Size                                                                                                     | Dependencies                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm][npmjs-package-badge]][npmjs-package] | ![npm bundle size][bundlesize-badge] | ![Libraries.io dependency status for latest release][dependabot-badge] |

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

````ts
import { DocumentAssets, NormalizedAsset } from '@archivator/archivable'

// HTML Source document URL from where the asset is embedded
// Notice the source might not be the same as where images are stored
const sourceDocument = 'http://www1.example.net/articles/1'

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
 * @type {import('@archivator/archivable').NormalizedAssetType}
 */
const normalized = new NormalizedAsset(sourceDocument, assetUrl)
````

### DocumentAssets

When we have more than one asset to download, we might have a list of assets, we can use `DocumentAssets` _class_.

Using it, we can iterate from it [because it implements `Iterable` the protocol][exploringjs--ch_sync-generators]
and treat it as if it's an array of `NormalizedAsset` items.

[exploringjs--ch_sync-generators]: https://exploringjs.com/impatient-js/ch_sync-generators.html '35 Synchronous generators (advanced)'

```js
import { DocumentAssets } from '@archivator/archivable'

// HTML Source document URL from where the asset is embedded
const sourceDocument = 'http://renoirboulanger.com/about/projects/'

// List of URLs you might find on that URL
// e.g. `<img src="//example.org/a/b.png" />`
// Notice some URLs are relative, protocol-relative, others are going on another domain
const matches = [
  // Case 1: On an almost (no protocol) fully-qualified URL, on another domain
  '//www.example.org/a/b/c.png',
  // Case 2: Relative URL to the current source document
  '../../avatar.jpg',
  // Case 3: Fully qualified URL that is local to the site
  'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
  // Case 4: Fully qualified URL that is outside
  'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
  // Case 5: Fully qualified  URL that is outside and protocol relative
  '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
  // Case 6: Relative URL to the domain name, starting at root
  '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
]

/**
 * Leverage ECMAScript 2015+ Iteration prototocol.
 *
 * Pass a collection of strings, get a normalized list with iteration.
 *
 * @type {Iterable<import('@archivator/archivable').NormalizedAssetType>}
 */
const assets = new DocumentAssets(sourceDocument, matches)
for (const normalized of assets) {
  // It is a generator function, we can iterate normalized like an array.
  // If we were in an asychronous function, we'd be able to await each step.
  // In this example, we're simply using the return of assetCollectionNormalizer like we would with an array.
  console.log(normalized)
}
```

#### Change `reference` hashing format

In the above example, the first item looks like this;

```json
{
  "match": "//www.example.org/a/b/c.png",
  "src": "http://www.example.org/a/b/c.png",
  "dest": "renoirboulanger.com/about/projects/4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png",
  "reference": "4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png"
}
```

The asset file "`4c49ccbf4cdbdbcfc7f91cf87f6e9636008e4a97.png`" contains the SHA1 hash for "`http://www.example.org/a/b/c.png`".

Notice that the initial match was "`//www.example.org/a/b/c.png`" (the "`match`" attribute), but the "`src`" (where we will download image from) saw that the "`sourceDocument`" had `http` as protocol. If the protocol was `https`, the "`src`" (and the hash) would be different.

About the hashing, if you'd prefer a shorter file name, or use a different hashing function.

You can change it by using `DocumentAssets.setReferenceHandler(hasherFn, normalizerFn)` method.

The arguments are:

`hasherFn`
: Where you can provide your own hashing function. See [crypto.ts](https://github.com/renoirb/archivator/blob/v3.x-dev/packages/archivable/src/crypto.ts) if you're OK with [Node.js’ **Crypto** module](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options)

`normalizerFn`
: A function with signature `(file: string) => string` where you can append the file extension, refer to [normalizer/asset.ts](https://github.com/renoirb/archivator/blob/v3.x-dev/packages/archivable/src/normalizer/asset.ts) at `assetFileExtensionNormalizer`.

```ts
// ... Continuing from example above
import {
  HashingFunctionType,
  createHashFunction,
  NormalizedAssetFileExtensionExtractorType,
} from '@archivator/archivable'

// One can set its own hash function
// As long as the returned createHashFunction is of type `(msg: string) => string`
const hashingHandler = createHashFunction('md5', 'hex')

/**
 * In the example below, in every case, the file extension would ALWAYS be ".foo".
 * We could eventually use the file's mime-type, or the source's response headers. #TODO
 */
const extensionHandler: NormalizedAssetFileExtensionExtractorType = (
  foo: string,
): string => `.foo`

collection.setReferenceHandler(
  assetReferenceHandlerFactory(hashingHandler, extensionHandler),
)
```

With the above configuration in place, for the item "`//www.example.org/a/b/c.png`",
we'd have the md5 hash as `6a324cd1a0e4e480c4db3e0558360527` with `.foo`

Which would then look like this;

```json
[
  {
    "dest": "renoirboulanger.com/page/3/6a324cd1a0e4e480c4db3e0558360527.foo",
    "match": "//www.example.org/a/b/c.png",
    "reference": "6a324cd1a0e4e480c4db3e0558360527.foo",
    "src": "http://www.example.org/a/b/c.png"
  }
]
```
