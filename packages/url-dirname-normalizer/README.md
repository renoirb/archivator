# [url-dirname-normalizer][repo-url]

> Normalize URLs to be valid filesystem paths for archiving web pages and their
> assets

[repo-url]:
  https://github.com/renoirb/archivator/blob/v3.x-dev/packages/url-dirname-normalizer
  'URL Directory Name Normalizer'
[npmjs-package-badge]:
  https://img.shields.io/npm/v/url-dirname-normalizer?style=flat-square&logo=appveyor&label=npm&logo=npm
[npmjs-package]: https://www.npmjs.com/package/url-dirname-normalizer
[bundlesize-badge]:
  https://img.shields.io/bundlephobia/min/url-dirname-normalizer?style=flat-square
[dependabot-badge]:
  https://img.shields.io/librariesio/release/npm/url-dirname-normalizer?style=flat-square&logo=appveyor&logo=dependabot

| Version                                      | Size                                 | Dependencies                                                           |
| -------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| [![npm][npmjs-package-badge]][npmjs-package] | ![npm bundle size][bundlesize-badge] | ![Libraries.io dependency status for latest release][dependabot-badge] |

## Usage

### dirnameNormalizer

The default exported function is; `dirnameNormalizer`.

```js
import dirnameNormalizer from 'url-dirname-normalizer'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510'

/**
 * Filesystem path where to write files to
 */
dirnameNormalizer(sourceDocument)
// > "example.org/ausername/some-lengthy-string-ending-with-a-hash"
```

### normalizer

Alongside the default export, there is also a `normalizer` with a few methods.

Refer to notes in
[**pathName** in `normalizer/path-name.ts`](./src/normalizer/path-name.ts) and
[**searchParams** in `normalizer/search-params.ts`](./src/normalizer/search-params.ts)

```js
import { normalizer } from 'url-dirname-normalizer'
const examplePathName = 'http://www.example.org/fOo/Bar/bAAz.html'
normalizer.pathName(examplePathName)
// > "/foo/bar/baaz"

const exampleSearchParams = 'http://example.org/foo?zulu=please&bar=bazz&buzz'
normalizer.searchParams(exampleSearchParams)
// > "/bar/bazz/zulu/please"
```
