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

// cheerio, or https://github.com/lapwinglabs/x-ray
// http://noodlejs.com/#Overview
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as fs from 'async-file';
import {prepareListGenerator} from './common';

async function handle(element, promisedPayload) {
  return promisedPayload.text()
    .then(payload => cheerio.load(payload))
    .then(shard => shard.html());
}

async function cache(elementList, where) {
  const processed = {ok: [], failed: []}; // eslint-disable-line prefer-const
  for (const element of elementList) {
    const dirName = `${where}/${element.name}`;
    const fileName = `${dirName}/cache.html`;
    await fs.createDirectory(dirName);
    if ((await fs.exists(fileName)) === false) {
      const response = await fetch(element.url);
      if (response.ok === true) {
        processed.ok.push(element.url);
        const pageSnippet = await handle(element, response);
        await fs.writeTextFile(fileName, pageSnippet, 'utf8');
        console.info(`Archived ${fileName}`);
      } else {
        processed.failed.push(element.url);
        console.info(`Had problem with ${element.url}`);
      }
    } else {
      console.info(`Already exists ${fileName}`);
    }
  }
}

async function fetcher(list, where = 'archive') {
  await cache(prepareListGenerator(list), where);
}

export default fetcher;
