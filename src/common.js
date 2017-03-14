'use strict';

import fs from 'fs';
import pathutil from 'path';
import readlines from 'gen-readlines';
import slugifier from './normalizer/slugs';

/**
 * Co Routine - A Generator factory helper
 *
 * Pass a Generator closure and Immediately Invoke that helper
 * so that we can iterate using generators as async handlers.
 *
 * This pattern is used so we can use generators as async consumers
 * or as async handlers.
 */
function coroutine(gen) {
  return function (...args) {
    const g = gen(...args);
    g.next();
    return g;
  };
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
  // Handle error codes below #TODO
  // if (errorObj.code === 'ENOTFOUND')
  console.error('handleIndexSourceErrors', errorObj);
}

export {
  readLines,
  coroutine,
  parseCsvLine,
  prepareListGenerator,
  handleIndexSourceErrors
};
