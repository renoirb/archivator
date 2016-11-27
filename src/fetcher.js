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
import {prepareList} from './common';

function handleFailedUrls(failedUrls) {
  for (const element of failedUrls) {
    console.error(`Failed to handle "${element.url}"`);
  }
}

async function format(element, promisedPayload) {
  return promisedPayload.text()
    .then(payload => cheerio.load(payload))
    .then(shard => {
      const html = shard.html();
      return `${element.url}\n${html}\n\n\n\n\n`;
    });
}

async function _main(elementList, where) {
  let failedUrls = []; // eslint-disable-line prefer-const
  for (const element of elementList) {
    const dirName = `${where}/${element.name}`;
    const fileName = `${dirName}/index.md`;
    if ((await fs.exists(fileName)) === false) {
      const response = await fetch(element.url);
      if (response.ok === true) {
        await fs.createDirectory(dirName);
        const pageSnippet = (await format(element, response));
        await fs.writeTextFile(fileName, pageSnippet, 'utf8');
      } else {
        failedUrls.push(element, response);
      }
      console.info(`Archived ${element.name}`);
    } else {
      console.info(`Already exists ${element.name}`);
    }
  }
  handleFailedUrls(failedUrls);
}

async function fetcher(list, where = 'archive') {
  await _main(prepareList(list), where);
}

export default fetcher;
