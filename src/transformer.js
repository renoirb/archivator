'use strict';

/**
 * Transformer
 *
 * Read cached HTML files, transform them so we get only the main content
 */

// cheerio, or https://github.com/lapwinglabs/x-ray
// http://noodlejs.com/#Overview
import cheerio from 'cheerio';
import * as fs from 'async-file';

async function handleDocument(recv) {
  const cheerioConfig = {normalizeWhitespace: true, xmlMode: false, decodeEntities: true};
  const data = new Promise(resolve => resolve(cheerio.load(recv, cheerioConfig)));

  return data
    .then(shard => {
      const list = [];
      shard('body img[src]').each((_, element) => {
        list.push(shard(element).attr('src'));
      });
      return list;
    });
}

async function readDocument(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return data;
}

function readDocumentError(errorObj) {
  // Handle error codes below #TODO
  switch (errorObj.code) {
    case 'ENOENT':
      // ENOENT: no such file or directory, open '...' Handle differently? #TODO
      console.error(`readDocumentError (code ${errorObj.code}: Could not access file at "${errorObj.path}"`);
      break;
    default:
      console.error(`readDocumentError (code ${errorObj.code}: ${errorObj.message}`);
      break;
  }
  return {ok: false};
}

async function transform(listArchivable, where) {
  for (const archivable of listArchivable) {
    const dirName = `${where}/${archivable.slug}`;
    const fileName = `${dirName}/cache.html`;
    const fileContents = await readDocument(fileName).catch(readDocumentError);
    const handledDocument = await handleDocument(fileContents, archivable);
    const prep = {slug: fileName, url: archivable.url, assets: handledDocument};
    // Not finished here #TODO
    console.log(JSON.stringify(prep));
  }
}

async function transformer(list, where = 'archive') {
  await transform(list, where);
}

export default transformer;
