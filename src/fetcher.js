'use strict';

/**
 * Archivator
 *
 * Archive URLs into text files
 *
 * Big thanks to https://hackernoon.com/an-ode-to-async-await-7da2dd3c2056#.heq66t6kh
 *
 * * https://github.com/bitinn/node-fetch
 * * https://github.com/cheeriojs/cheerio
 * * https://github.com/davetemplin/async-file
 * * https://github.com/kriasoft/babel-starter-kit/blob/master/package.json
 */

import cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as fs from 'async-file';

async function handleDocument(recv) {
  return recv.text()
    .then(payload => cheerio.load(payload))
    .then(shard => shard.html());
}

async function fetchDocument(url) {
  return fetch(url)
    .catch(fetchDocumentError);
}

function fetchDocumentError(errorObj) {
  // Handle error codes below #TODO
  // if (errorObj.code === 'ETIMEDOUT')
  // if (errorObj.code === 'ENETUNREACH')
  console.error(`fetchDocumentError (code ${errorObj.code}: ${errorObj.message}`);
  return {ok: false};
}

async function cache(listArchivable, where) {
  const processed = {ok: [], failed: []}; // eslint-disable-line prefer-const
  for (const archivable of listArchivable) {
    const dirName = `${where}/${archivable.slug}`;
    const fileName = `${dirName}/cache.html`;
    await fs.createDirectory(dirName);
    if ((await fs.exists(fileName)) === false) {
      const response = await fetchDocument(archivable.url);
      if (response.ok === true) {
        processed.ok.push(archivable.url);
        const pageSnippet = await handleDocument(response);
        await fs.writeTextFile(fileName, pageSnippet, 'utf8');
        console.info(`Archived ${fileName}`);
      } else {
        processed.failed.push(archivable.url);
        console.info(`Had problem with ${archivable.url}`);
      }
    } else {
      console.info(`Already exists ${fileName}`);
    }
  }
}

async function fetcher(list, where = 'archive') {
  await cache(list, where);
  console.log(`Done fetching.\n\n`);
  return Promise.all(list);
}

export default fetcher;
