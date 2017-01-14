'use strict';

import {URL} from 'url';

function urlToName(url) {
  let urlObj = {};
  try {
    urlObj = new URL(url);
  } catch (err) {
    throw new Error(url, err);
  }
  return String(urlObj.hostname + urlObj.pathname)
          .replace(/^https/, 'http')
          .replace(/^http:\/\/(.*)/, '$1')
          .replace(/(@|www\.)/g, '')
          .replace(/[=%&#()]/, '')
          .replace(/[:]/, '/')
          .replace(/\.(html?|php|xml|aspx?)/, '')
          .replace(/\/$/, '')
          .toLowerCase();
}

function * prepareListGenerator(urls) {
  for (const line of urls) {
    yield parseCsvLine(line);
  }
}

function parseCsvLine(line) {
  const [url, selector, truncate] = line.split(';');
  const name = urlToName(url);
  return {url, name, selector, truncate};
}

export {
  urlToName,
  prepareListGenerator,
  parseCsvLine
};
