# [url-dirname-normalizer][repo-url]

> Normalize URLs to be valid filesystem paths for archiving web pages and their
> assets

[repo-url]:
  https://github.com/renoirb/archivator/tree/v3.x-dev/packages/url-dirname-normalizer
  'URL Directory Name Normalizer'
[npmjs-package-badge]:
  https://img.shields.io/npm/v/url-dirname-normalizer?style=flat-square&logo=appveyor&label=npm&logo=npm
[npmjs-package]: https://www.npmjs.com/package/url-dirname-normalizer
[bundlesize-badge]:
  https://img.shields.io/bundlephobia/min/url-dirname-normalizer?style=flat-square
  'Bundle Size'
[dependabot-badge]:
  https://img.shields.io/librariesio/release/npm/url-dirname-normalizer?style=flat-square&logo=appveyor&logo=dependabot

| Version                                      | Size                                 | Dependencies                                                           |
| -------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| [![npm][npmjs-package-badge]][npmjs-package] | ![npm bundle size][bundlesize-badge] | ![Libraries.io dependency status for latest release][dependabot-badge] |

## Usage

### dirnameNormalizer

```js
import dirnameNormalizer from 'url-dirname-normalizer'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS

const sourceDocument =
  'http://example.org/foo?Yankee=ZULU&bar=bazz&buzz=BIZZ&whiskey'

/**
 * Filesystem path where to write files to
 *
 * Notice:
 * - "yankee" isn't present
 * - "buzz" is present because of the equal sign
 * - Everything is lowercase
 */
dirnameNormalizer(sourceDocument)
// > "example.org/foo/bar/bazz/buzz/bizz/yankee/zulu"
```
