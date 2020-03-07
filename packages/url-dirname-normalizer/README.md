# [url-dirname-normalizer][repo-url]

> Normalize URLs to be valid filesystem paths for archiving web pages and their assets

[repo-url]: https://github.com/renoirb/archivator/blob/v3.x-dev/packages/url-dirname-normalizer 'URL Directory Name Normalizer'

| Version                                                                                                                                                                | Size                                                                                                 | Dependencies                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm](https://img.shields.io/npm/v/url-dirname-normalizer?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/url-dirname-normalizer) | ![npm bundle size](https://img.shields.io/bundlephobia/min/url-dirname-normalizer?style=flat-square) | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/url-dirname-normalizer?style=flat-square&logo=appveyor&logo=dependabot) |

## Usage

### directoryNameNormalizer

There is only one exported function; `directoryNameNormalizer`.

```js
import directoryNameNormalizer from 'url-dirname-normalizer'

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
