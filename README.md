# [Archivator][public-url]

Ever wanted to be _Archiving your own copies of articles you’ve enjoyed_?
To be able to search through them?

This is the home for various packages related to _Archivator_, See [Packages](#packages).

This project is a means to try out ECMAScript 2017 tooling and do something useful.
See [Challenge](#challenge) below.

__CURRENT STATUS__: [3rd refactor][current-tree]. ([initial _v1.x_][initial], [rework][rework]), you can try [initial _v1.x_][initial] by cloning [renoirb/archivator-demo](https://github.com/renoirb/archivator-demo).

[public-url]: http://archivator.site 'Public Archivator.Site'
[current-tree]: https://github.com/renoirb/archivator/tree/v3.x-dev 'Current attempt, leveraging Monorepo and heavy testing'
[initial]: https://github.com/renoirb/archivator/tree/v1.0.0 'Initial prototype, current v1.x published release train, frozen since Nov 2017'
[rework]: https://github.com/renoirb/archivator/tree/v2.0.0 'Rework attempt, dropped in Sept 2018'
[rushstack]: https://github.com/microsoft/rushstack 'Rush Stack for managing Monorepos'

## Features

- Cache HTML payload of source Web Pages URLs we want archived
- Store files for each source URL at a consistent path name
  - Extract assets, download them for archiving purposes
  - Download images ("assets") from Web Pages
  - Rename assets in archive and adjust archived version to use cached copies
  - Do not download tracking images and/or ignore inline `base64` images
- Read link list from different source list
  - CSV file
- Extract the main content for each article
- Export into simplified excerpt document

## Packages

This is the home for various packages related to _Archivator_.

It is built with multiple smaller packages, leveraging Microsoft’s [RushStack][rushstack].

| Name                          | Folder                                                                 | Version                                                                                                                                                                                      | Size                                                                                                            | Dependencies                                                                                                                                                                           | Changelog                                           |
| ----------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| archivator        | [/apps/archivator](./apps/archivator/) | [![npm](https://img.shields.io/npm/v/archivator?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/archivator)                       | ![npm bundle size](https://img.shields.io/bundlephobia/min/archivator?style=flat-square)            | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/archivator?style=flat-square&logo=appveyor&logo=dependabot)            | [𝌡](./apps/archivator/CHANGELOG.md) |
| url-dirname-normalizer        | [/packages/url-dirname-normalizer](./packages/url-dirname-normalizer/) | [![npm](https://img.shields.io/npm/v/url-dirname-normalizer?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/url-dirname-normalizer)                       | ![npm bundle size](https://img.shields.io/bundlephobia/min/url-dirname-normalizer?style=flat-square)            | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/url-dirname-normalizer?style=flat-square&logo=appveyor&logo=dependabot)            | [𝌡](./packages/url-dirname-normalizer/CHANGELOG.md) |
| @archivator/archivable        | [/packages/archivable](./packages/archivable/)                         | [![npm](https://img.shields.io/npm/v/%40archivator%2Farchivable?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/%40archivator%2Farchivable)               | ![npm bundle size](https://img.shields.io/bundlephobia/min/%40archivator%2Farchivable?style=flat-square)        | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/%40archivator%2Farchivable?style=flat-square&logo=appveyor&logo=dependabot)        | [𝌡](./packages/archivable/CHANGELOG.md)             |
| @archivator/content-divinator | [/packages/content-divinator](./packages/content-divinator/)           | [![npm](https://img.shields.io/npm/v/%40archivator%2Fcontent-divinator?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/%40archivator%2Fcontent-divinator) | ![npm bundle size](https://img.shields.io/bundlephobia/min/%40archivator%2Fcontent-divinator?style=flat-square) | ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/%40archivator%2Fcontent-divinator?style=flat-square&logo=appveyor&logo=dependabot) | [𝌡](./packages/content-divinator/CHANGELOG.md)      |


## Contributing

Refer to [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)

## Challenge

Make an archiving system while learning how to use bleeding edge TypeScript/JavaScript/ECMAScript.

- Use ECMAScript 2016’ Async/Await along with Generators when applicable
- Figure out how to export into ES5
- Figure out how to package, test and so on
- Least number of dependencies as possible for development
- No dependencies to run once bundled
