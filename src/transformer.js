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

import hasher from './normalizer/hash';
import assetizer from './normalizer/assets';

const cheerioConfig = {normalizeWhitespace: true, xmlMode: false, decodeEntities: true};

async function handleDocument(recv) {
  const p = new Promise(resolve => resolve(cheerio.load(recv, cheerioConfig)));
  return p.then(shard => {
    // We do not need duplicates
    const s = new Set();
    /**
     * Iterate with other types of assets.
     * TODO
     */
    shard('body img[src]').each((_, element) => {
      const potential = shard(element).attr('src');
      s.add(potential);
    });
    // We can return an Array once done
    return [...s];
  });
}

/**
 * Rework each asset so we can prepare to fetch
 *
 * Input is a list of resources in many possible format
 *
 * e.g.
 * matches = [ "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg"
 *            ,"https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
 *            ,"https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
 *            ,"//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500"
 *            ,"/wp-content/themes/renoirb/assets/img/zce_logo.jpg" ]
 *
 * archivable = { url: "http://renoirboulanger.com/page/3/"
 *               ,slug: 'renoirboulanger.com/page/3"}
 *
 * Running handleAssets(matches, archivable) gives us a cleaned up list of assets where is a good guess
 * the asset might be found so we can make a copy and archive it.
 *
 * Notice:
 * - Each dest file are hashes with extension
 * - Gravatar sample started by //, and below, at src value, we'll have over http
 * - zce_logo.png is in /wp-content/..., but below at src value, it's on renoirboulanger.com
 *
 * e.g.
 * {
 *   "assets": [{
 *         "src": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *         "match": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *         "dest": "renoirboulanger.com/page/3/430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg"
 *     },{
 *         "src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *         "match": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *         "dest": "renoirboulanger.com/page/3/b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png"
 *     },{
 *         "src": "http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *         "match": "//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *         "dest": "renoirboulanger.com/page/3/63dc122dfd3c702e12714fbe4ba744e463c49edb.img"
 *     },{
 *         "src": "http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *         "match": "/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *         "dest": "renoirboulanger.com/page/3/840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg"
 *   }]
 * }
 */
async function handleAssets(matches, archivable) {
  // console.log('handleAssets', [matches, archivable]); // DEBUG
  const p = new Promise(resolve => resolve(matches));
  return p.then(m => {
      const reduced = [];
      m.forEach(match => {
        const src = assetizer(archivable.url, match);
        const dest = `${archivable.slug}/${hasher(src)}`;
        reduced.push({src, match, dest});
      });
      return reduced;
    });
}

async function readCached(where, filePath) {
  const path = `${where}/${filePath}`;
  const data = await fs.readFile(path, 'utf8');
  return data;
}

function readCachedError(errorObj) {
  // Handle error codes below #TODO
  switch (errorObj.code) {
    case 'ENOENT':
      // ENOENT: no such file or directory, open '...' Handle differently? #TODO
      console.error(`readCachedError (code ${errorObj.code}): Could not access file at "${errorObj.path}"`);
      break;
    default:
      console.error(`readCachedError (code ${errorObj.code}): ${errorObj.message}`);
      break;
  }
  return {ok: false};
}

async function transform(listArchivable, where) {
  for (const archivable of listArchivable) {
    const cachedFileName = `${archivable.slug}/cache.html`;
    const cached = await readCached(where, cachedFileName).catch(readCachedError);
    const matches = await handleDocument(cached);
    const assets = await handleAssets(matches, archivable);
    const prep = {source: {cache: cachedFileName, src: archivable.url}, assets};
    // prep.matches = await handleDocument(matches); // DEBUG
    // Not finished here #TODO
    console.log(JSON.stringify(prep));
  }
}

async function transformer(list, where = 'archive') {
  await transform(list, where);
}

export default transformer;