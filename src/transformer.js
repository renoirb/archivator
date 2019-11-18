'use strict';

/**
 * Transformer
 *
 * Read cached HTML files, transform them so we get only the main content
 */

import fetch from 'node-fetch';
import * as fsa from 'async-file';

import {
  readFileWithErrorHandling
} from './common';

async function downloadAssets(archivable) {
  const assets = archivable.assets;
  const slug = archivable.slug;
  console.log(`  assets:`);
  console.log(`    length: ${assets.length}`);
  console.log(`    files:`);
  if (assets.length > 0) {
    for (const asset of assets) {
      const src = asset.src;
      const name = asset.name;
      const dest = `${slug}/${name}`;
      await download(src, dest).catch(downloadError);
    }
  }
}

async function download(src, dest) {
  const fileName = `archive/${dest}`; // Make parent folder configurable #TODO
  const fileExists = await fsa.exists(fileName);
  console.log(`    - ${src}:`);
  console.log(`      exists: ${fileExists.toString()}`);
  console.log(`      dest: ${dest}`);
  if (fileExists === false) {
    // Should we pass a User-Agent string? #TODO
    // ... and a Referrer. As if we downloaded it from a UA?
    const recv = await fetch(src);
    console.log('download', {src, dest, fileName, fileExists, recv: {ok: recv.ok}});
    if (recv.ok === true) {
      // console.log(`        dest: ${fileName}`);
      const dest = await fsa.createWriteStream(fileName);
      recv.body.pipe(dest);
      // console.log(`        status: OK`);
    } else {
      console.log(`        status: ERR, could not download.`);
    }
  }
}

function downloadError(errorObj) {
  switch (errorObj.code) {
    case 'ECONNREFUSED':
      console.error(`downloadError (code ${errorObj.code}): Could not download ${errorObj.message}`);
      break;
    case 'ECONNRESET':
      console.error(`downloadError (code ${errorObj.code}): Could not continue ${errorObj.message}`);
      break;
    default:
      console.error(`downloadError (code ${errorObj.code}): ${errorObj.message}`, errorObj);
      break;
  }
  return Promise.resolve({});
}

async function main(archivable) {
  try {
    const slug = archivable.slug;
    const cachedFilePath = `archive/${slug}`; // Make parent folder configurable #TODO
    const cachedFileName = `${cachedFilePath}/document.html`;
    const cacheJsonFile = `${cachedFilePath}/document.json`;
    const body = await readFileWithErrorHandling(cachedFileName);
    await archivable.setBody(body);
    if ((await fsa.exists(cacheJsonFile)) === false) {
      const documentJson = archivable.toJSON();
      await fsa.writeTextFile(cacheJsonFile, JSON.stringify(documentJson), 'utf8');
    }
    await downloadAssets(archivable);
  } catch (err) {
    // Not finished here, need better error handling #TODO
    console.error(err);
  }
}

export default main;
