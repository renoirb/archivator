# Archivator

**CURRENT STATUS**: Under **heavy** development

Ever wanted to archive your own copy of articles you enjoyed reading
and to be able to search through them?

This project is a means to try out ECMAScript 2017 tooling and do something useful.
See *Challenge* below.

The objective of this project is to:

* Cache HTML payload of source Web Pages URLs we want archived (see `src/fetcher.js`)
* Store files for each source URL at a consistent path name (see `src/slugifier.js`)
* Extract the main content for each article
* Export into simplified excerpt document
* Add documents into a search index


## Use

Install production only dependencies.

Assuming you have `dist/` compiled (see *Build* below), and you deleted `node_modules/`.

```
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

And you should see HTML files in `archive/`

```
archive/
 `-renoirboulanger.com/
   `-blog/
     `-2015/
       `-05/
         |-add-openstack-instance-meta-data-info-salt-grains/
         |  `-cache.html
         `-converting-dynamic-site-static-copy/
            `-cache.html
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

* Use ECMAScript 2016’ Async/Await along with Generators (`function * (){ /* ... */ yield 'something'; }`)
* Figure out how to export into ES5
* Figure out how to package, test and so on
* Least number of dependencies as possible for development
* (Ideally) No dependencies to run once bundled


## Progress

* :white_check_mark: Cache HTML payload of source Web Pages URLs we want archived (see `src/fetcher.js`)
* :white_check_mark: Store files for each source URL at a consistent path name. With unit tests! (see `src/normalizer/path.js`)
* Extract paths from Cached HTML, download them for archiving purposes.
  * Download images from Web Pages
* Read link list from different source list
  * RSS xml document
  * CSV file
* Extract the main content for each article
* Export into simplified excerpt document
* Add documents into a search index
* Make a [stand-alone bundle using `Rollup`](https://gist.github.com/renoirb/eb935d86d58cdf03f487a07deb0c8d83)
* Make it an NPM package
