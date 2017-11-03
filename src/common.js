'use strict';

import fs from 'fs';
import pathutil from 'path';
import * as fsa from 'async-file';
import lines from 'gen-readlines';
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
  return function coroutineHandler(...args) {
    const g = gen(...args);
    g.next();
    return g;
  };
}

function * readLines(path) {
  const fd = fs.openSync(path, 'r');
  const stats = fs.fstatSync(fd);
  for (const line of lines(fd, stats.size)) {
    yield parseCsvLine(line.toString());
  }
  fs.closeSync(fd);
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

async function readCached(file) {
  try {
    const data = await fsa.readFile(file, 'utf8');
    return data;
  } catch (err) {
    readCachedError(err);
    return {};
  }
}

function readCachedError(errorObj) {
  // Handle error codes below #TODO
  switch (errorObj.code) {
    case 'ENOENT':
      // ENOENT: no such file or directory, open '...' Handle differently? #TODO
      console.error(`readCachedError: Could not access file at "${errorObj.path}"`);
      break;
    default:
      console.error(`readCachedError: ${errorObj.message}`);
      break;
  }
}

export {
  readCached,
  readLines,
  coroutine,
  parseCsvLine,
  handleIndexSourceErrors
};
