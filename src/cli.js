'use strict';

import * as fs from 'async-file';
import read from 'read-all-stream';
import fetcher from './fetcher';
import pathutil from 'path';

const URL_LIST = 'archive/index.csv';

function handleErrors(errorObj) {
  if (errorObj.code === 'ENOENT' && Boolean(errorObj.path)) {
    const dirName = pathutil.dirname(errorObj.path);
    fs.createDirectory(dirName);
    const fileContents = 'http://renoirb.com;#contents;';
    const msg = `File "${errorObj.path}" did not exist, we created one. Try again.`;
    fs.writeTextFile(errorObj.path, fileContents, 'utf8');
    throw new Error(msg);
  }
}

read(fs.createReadStream(URL_LIST))
  .then(data => data.split('\n'))
  .then(lines => fetcher(lines))
  .catch(handleErrors);
