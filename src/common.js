'use strict';

import {URL} from 'url';
import fs from 'fs';
import pathutil from 'path';
import readlines from 'gen-readlines';

/**
 * The following passes could be one multi-line
 * but it's easier to debug like that if we need
 * to review the pass rules.
 */
function handleSearchParam(urlObjSearchProperty = '') {
  // Explode at &, and sort search params order for consistent results
  // ?b=2&a=1&c=  -> [a=1, b=2, c=]
  // ?a=1&c=&b=2  -> [a=1, b=2, c=]
  const pass = urlObjSearchProperty.replace(/^\?/, '').split('&').sort();
  // Filter out empty elements
  // ?b=2&a=1&c=  -> [a=1, b=2]
  // ?b=2&a=1&c   -> [a=1, b=2]
  const pass2 = pass.map(e => e.split('='));
  const pass3 = pass2.filter(e => Boolean(e[1]));
  const pass4 = pass3.map(e => e.join('/'));
  const out = String('/' + pass4.join('/')).replace(/pageI?d?/i, 'page');
  return (/^\/$/.test(out)) ? '' : out;
}

function handlePathName(urlObjPathName = '') {
  return String(urlObjPathName)
          .replace(/-[a-z0-9]{5,}$/, '')
          .replace(/%40/, '_at_')
          .replace(/\.(action|fcgi)/, '')
          .replace(/\/$/, '')
          .replace(/:/, '/')
          .replace(/\/\//, '/')
          .replace(/[@=%&#()~!,]+/g, '')
          .replace(/\.(html?|php|xml|aspx?)/, '');
}

function slugifier(url) {
  let urlObj = {};
  try {
    urlObj = new URL(url);
  } catch (err) {
    throw new Error(url, err);
  }
  const search = handleSearchParam(urlObj.search);
  const pathname = handlePathName(urlObj.pathname);
  return String(`${urlObj.hostname}${pathname}${search}`)
          .toLowerCase()
          .replace(/^https/, 'http')
          .replace(/^http:\/\//, '')
          .replace(/(www\.)/g, '');
}

function * readLines(path) {
  const fd = fs.openSync(path, 'r');
  const stats = fs.fstatSync(fd);
  for (const line of readlines(fd, stats.size)) {
    yield parseCsvLine(line.toString());
  }
  fs.closeSync(fd);
}

function * prepareListGenerator(urls) {
  for (const line of urls) {
    yield parseCsvLine(line);
  }
}

function parseCsvLine(line) {
  const [url, selector = '', truncate = ''] = line.split(';');
  const slug = slugifier(url);
  return {url, slug, selector, truncate};
}

function handleIndexSourceErrors(errorObj) {
  if (errorObj.code === 'ENOENT' && Boolean(errorObj.path)) {
    const dirName = pathutil.dirname(errorObj.path);
    fs.createDirectory(dirName);
    const fileContents = 'http://renoirb.com;#contents;';
    const msg = `File "${errorObj.path}" did not exist, we created one. Try again.`;
    fs.writeTextFile(errorObj.path, fileContents, 'utf8');
    throw new Error(msg);
  }
  console.error(errorObj);
}

export {
  readLines,
  slugifier,
  parseCsvLine,
  prepareListGenerator,
  handleIndexSourceErrors
};
