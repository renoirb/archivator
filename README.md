# Archivator

**CURRENT STATUS**: Under **heavy** development

Ever wanted to archive your own copy of articles you enjoyed reading
and to be able to search through them?

This project is a mean to try out ECMAScript 2017 tooling and do something useful.
See *Challenge* below.

The objective of this project is to:
* Archive HTML of Web Pages I want to keep a copy (see `src/fetcher.js`)
* Extract the main conent for each article (TODO)
* Export into simplified excerpt document (TODO)
* Add documents into a search index (TODO)


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

**TODO**:
* How to make a [stand-alone bundle using `Rollup`](https://gist.github.com/renoirb/eb935d86d58cdf03f487a07deb0c8d83)
* How to import from another project
* How to package so that this demo above would work


### Run through Babel

```
npm install
npm start
```

Assuming you have the following in `src/index.js`

```
// File src/index.js
// ...
urls.push(['https://renoirboulanger.com/blog/2015/05/converting-dynamic-site-static-copy/', 'article']);
urls.push(['https://renoirboulanger.com/blog/2015/05/add-openstack-instance-meta-data-info-salt-grains/', 'article']);
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
       |-renoirboulanger.com
       |---blog
       |-----2015
       |-------05
       |---------add-openstack-instance-meta-data-info-salt-grains
       |---------converting-dynamic-site-static-copy
```

### Run xo (coding convention linter)

```
npm install
npm run lint
```

### Build

```
npm install
npm run build
node example.js
```


## Challenge

Make an archiving system while learning how to use bleeding edge JavaScript.

* Use ECMAScript 2016’ Async/Await along with Generators (`function * (){ /* ... */ yield 'something'; }`)
* Figure out how to export into ES5
* Figure out how to package, test and so on
* Least number of dependencies as possible for development
* (Ideally) No dependencies to run once bundled

