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

async function handleHtmlDocument(recv) {
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
}

async function cache(listArchivable) {
  for (const archivable of listArchivable) {
    const dirName = `archive/${archivable.slug}`; // Make parent folder configurable #TODO
    const fileName = `${dirName}/cache.html`;
    try {
      await fs.createDirectory(dirName);
      if ((await fs.exists(fileName)) === false) {
        const response = await fetchDocument(archivable.url);
        if (response.ok === true) {
          const pageSnippet = await handleHtmlDocument(response);
          await fs.writeTextFile(fileName, pageSnippet, 'utf8');
          console.info(`Archived ${fileName}`);
        } else {
          console.info(`Had problem with ${archivable.url}`);
        }
      } else {
        console.info(`Already exists ${fileName}`);
      }
    } catch (err) {
      console.info(`Had problem with ${archivable.url}: ${err.message}`);
    }
  }
}

async function fetcher(list) {
  await cache(list);
  console.log(`Done fetching.\n\n`);
  return Promise.all(list);
}

export default fetcher;
