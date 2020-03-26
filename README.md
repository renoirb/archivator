# [Archivator][repo-url]

> Ever wanted to archive your own copy of articles you enjoyed reading
> and to be able to search through them?

| Version                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm](https://img.shields.io/npm/v/archivator?style=flat-square&logo=appveyor&label=npm&logo=npm)](https://www.npmjs.com/package/archivator) |

**CURRENT STATUS**: This is frozen **v1.x** branch, [future work is under **v3.x-dev** branch][third-rewrite], **but usable as-is** see [renoirb/archivator-demo][archivator-demo]

[repo-url]: https://github.com/renoirb/archivator
[third-rewrite]: https://github.com/renoirb/archivator/tree/v3.x-dev#third-rewrite
[archivator-demo]: https://github.com/renoirb/archivator-demo

## Summary

This project is a means to try out ECMAScript 2017 tooling and do something useful.
See [Challenge](#challenge) below.

The objective of this project is to:

(**Note** Check marks below :white_check_mark: denotes that work had been done and should be usable)

- :white_check_mark: Cache HTML payload of source Web Pages URLs we want archived (see `src/fetcher.js`)
- :white_check_mark: Store files for each source URL at a consistent path name (see `src/normalizer/slugs.js`) (see **v3.x-dev** [url-dirname-normalizer][v3-url-dirname-normalizer])
  - :white_check_mark: Extract assets, download them for archiving purposes (see `src/transformer.js` at `extractAssets` and `src/normalizer/assets.js`) (see **v3.x-dev** [@archivator/archivable][v3-archivable])
  - :white_check_mark: Download images ("assets") from Web Pages (see **v3.x-dev** [@archivator/archivable][v3-archivable])
  - :white_check_mark: Rename assets in archive and adjust archived version to use cached copies (see `src/normalizer/hash.js` and `src/transformer.js` at `reworkAssetReference`) (see **v3.x-dev** [@archivator/archivable][v3-archivable])
  - :white_check_mark: Do not download tracking images and/or ignore inline `base64` images
- Read link list from different source list
  - RSS xml document
  - :white_check_mark: CSV file (_defaults_ to `archive/index.csv`)
- :white_check_mark: Extract the main content for each article (see `src/transformer.js` at `extractAssets`) (see **v3.x-dev** [@archivator/archivable][v3-archivable])
- :white_check_mark: Export into simplified excerpt document (see `src/transformer.js` at `markdownify`) (see **v3.x-dev** [@archivator/content-divinator][v3-content-divinator])
- Add documents into a search index
- Make a [stand-alone bundle using `Rollup`](https://gist.github.com/renoirb/eb935d86d58cdf03f487a07deb0c8d83)
- :white_check_mark: (incomplete) Make it usable as an external module (see [renoirb/archivator-demo](https://github.com/renoirb/archivator-demo))
- :white_check_mark: [Make it an NPM package][v1-package]

[v3-url-dirname-normalizer]: https://github.com/renoirb/archivator/tree/v3.x-dev/packages/url-dirname-normalizer 'Normalize URLs to be valid filesystem paths for archiving web pages and their assets'
[v3-archivable]: https://github.com/renoirb/archivator/tree/v3.x-dev/packages/archivable
[v3-content-divinator]: https://github.com/renoirb/archivator/tree/v3.x-dev/packages/content-divinator
[v1-package]: https://www.npmjs.com/package/archivator

## Use

Install production only dependencies.

Assuming you have `dist/` compiled (see _Build_ below), and you deleted `node_modules/`.

```bash
npm install --only=production
```

Edit `example.js`, add more `urls` (if you want)

```
node example.js
```

### Run through Babel

```
yarn install
```

Create a folder `archive/`, add an index file that we'll use to read and fetch pages from

File is CSV, using semi-column `;` as a separator, fields are:

1. URL to read from
2. CSS selector to main part of the content you want to keep
3. One or many CSS selectors (i.e. coma separated, like CSS supports already) of elements you want off of archives (e.g. ads)

```
// file archive/index.csv
https://renoirboulanger.com/blog/2015/05/converting-dynamic-site-static-copy/;article;
https://renoirboulanger.com/blog/2015/05/add-openstack-instance-meta-data-info-salt-grains/;article;
```

Run fetcher

```
npm start
```

You should see the following in the terminal output

```
...
Archived renoirboulanger.com/blog/2015/05/converting-dynamic-site-static-copy
Archived renoirboulanger.com/blog/2015/05/add-openstack-instance-meta-data-info-salt-grains
```

And you should see a few files getting created:

- _cache.html_: Is the raw HTML file download from the origin
- _cache.json_: Is a JSON cache of gathered metadata from the process
- _index.md_: Is the simplified article converted to Markdown
- Files with letters and numbers are images found in the document

```
archive/
 `-renoirboulanger.com/
   `-blog/
     `-2015/
       `-05/
         `-add-openstack-instance-meta-data-info-salt-grains/
           |- cache.html
           |- cache.json
           |- 5e6327f278a336349f8bb6b26163dabedb173bcd.png
           |- 881811befc2fa6ad9c8ec058e1be3bd231fdcc1f.png
           |- b69a780dc3278f5d86296d2f219821eeac385f20.jpg
           |- c0e21ae7f0a56374116f08b44087d07ab8710035.png
           |- c3d25fac5b0c573275b15822294e484097edd945
           |- cd5f2a6cfa00a45e755b07013e59cb7c03bb9826.jpg
           |- eb31cca43b832b0016a2211e6e0058b263f4a1c0.png
           |- f6c4338884f46d3942589fcc29611fa68b600bad.png
           |- index.md
```

### Run tests

```
npm test
```

### Run xo (coding convention linter)

```
npm run lint
```

### Build

Run in Node.js, as ECMASCript 5 transpiled code.

```
yarn install
npm run build
```

Should do the same as if we ran `npm start` with modern Node.js v6+ with Babel

```
node dist/cli.js
```

## Challenge

Make an archiving system while learning how to use bleeding edge JavaScript.

- Use ECMAScript 2016’ Async/Await along with Generators (`function * (){ /* ... */ yield 'something'; }`)
- Figure out how to export into ES5
- Figure out how to package, test and so on
- Least number of dependencies as possible for development
- (Ideally) No dependencies to run once bundled
