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

import fetch from 'node-fetch';
import * as fsa from 'async-file';

import {cheerioLoad} from './common';

const shouldIgnoreResponseHeader = name => ['set-cookie', 'cookie', 'connection', 'transfer-encoding'].includes(name);

async function handleDocument(recv) {
  return recv.text()
    .then(body => cheerioLoad(body))
    .then(shard => shard.html());
}

/**
 *
 * @param {String} url
 * @returns {Response} object from node-fetch
 */
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

async function formatHttpHeaderDump(response) {
  const lines = [];
  lines.push(response.url);
  lines.push('');
  response.headers.forEach((value, name) => {
    if (shouldIgnoreResponseHeader(name) === false) {
      const line = `${name}: ${value}`;
      lines.push(line);
    }
  });
  return lines.join(`\n`);
}

async function main(archivable) {
  const slug = archivable.slug;
  const url = archivable.url;
  const dirName = `archive/${slug}`; // Make parent folder configurable #TODO
  const fileName = `${dirName}/document.html`;
  const headersFileName = `${dirName}/document.headers.txt`;
  console.info(`\n\n----\n${url}:`);
  console.info(`  file: ${fileName}`);
  try {
    await fsa.createDirectory(dirName);
    if ((await fsa.exists(fileName)) === false) {
      const response = await fetchDocument(url);
      if (Reflect.has(response, 'ok') && response.ok === true) {
        const formattedHeaders = await formatHttpHeaderDump(response);
        await fsa.writeTextFile(headersFileName, formattedHeaders, 'utf8');
        const pageSnippet = await handleDocument(response);
        await fsa.writeTextFile(fileName, pageSnippet, 'utf8');
        console.info(`  status: Archived`);
      } else {
        console.info(`  status: NOT Archived`);
      }
    } else {
      console.info(`  status: Already archived`);
    }
  } catch (err) {
    console.info(`  status: Caught error: ${err.message}`);
  }

  return archivable;
}

export default main;
