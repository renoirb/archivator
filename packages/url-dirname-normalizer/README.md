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

````js
import { NormalizedAsset } from 'url-dirname-normalizer'

// Image tag src attribute value, e.g. `<img src="//example.org/a/b.png" />`
// Notice we used protocol relative URL
// (i.e. not specify https, meaning we'll use from source document)
const imgSrc = '//example.org/a/b.png'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path'

/**
 * Create a reference factory so we can resolve the URL based on that document URL
 *
 * Should look like this
 *
 * ```json
 * {
 *   "src": "http://example.org/a/b.png",
 *   "path": "blackhole.webpagetest.org/renoirb/archivator/test/normalizer/assets/ignore-path",
 *   "name": "b681c8e6a24db0d9ab038b0d57c5a1a8.png"
 * }
 * ```
 *
 * @type {import('url-dirname-normalizer').NormalizedAsset}
 */
const asset = new NormalizedAsset(sourceDocument, imgSrc)
````

