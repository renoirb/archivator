'use strict';

import fs from 'fs';
import pathutil from 'path';
import {URL} from 'url';
import cheerio from 'cheerio';
import * as fsa from 'async-file';
import lines from 'gen-readlines';

import blacklist from './lists/domains-blacklist';
import Archivable from './archivable';

function * iterateIntoArchivable(path) {
  const fd = fs.openSync(path, 'r');
  const stats = fs.fstatSync(fd);
  for (const line of lines(fd, stats.size)) {
    const csvLineString = line.toString();
    yield Archivable.fromLine(csvLineString);
  }
  fs.closeSync(fd);
}

function catcher(errorObj) {
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
  console.error('catcher', errorObj);
}

async function readFileWithErrorHandling(file) {
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

// Make possible to do extractLinks, markdownify, ... in parallel TODO
function cheerioLoad(recv, configObj = {}) {
  // console.log('async cheerioLoad', { recv, configObj })
  const loading = cheerio.load(recv, configObj);
  return Promise.resolve(loading);
}

const urlNotInBlacklist = u => {
  const assetUrlObj = new URL(u);
  const hostname = assetUrlObj.hostname;
  const includes = blacklist.includes(hostname);

  return includes === false;
};
export {
  readFileWithErrorHandling,
  iterateIntoArchivable,
  catcher,
  cheerioLoad,
  urlNotInBlacklist
};
