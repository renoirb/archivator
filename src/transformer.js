'use strict';

/**
 * Transformer
 *
 * Read cached HTML files, transform them so we get only the main content
 */

// cheerio, or https://github.com/lapwinglabs/x-ray
// http://noodlejs.com/#Overview
import {URL} from 'url';
import cheerio from 'cheerio';
import htmlmd from 'html-md-2';

import fetch from 'node-fetch';
import * as fs from 'async-file';

import hasher from './normalizer/hash';
import assetizer from './normalizer/assets';

const cheerioConfig = {normalizeWhitespace: true, xmlMode: false, decodeEntities: true};

const domainsBlacklist = ['in.getclicky.com', 's7.addthis.com', 'c.statcounter.com', 'sb.scorecardresearch.com', 'pubads.g.doubleclick.net', 'googleads.g.doubleclick.net'];

/**
 * Given every row in source file .csv
 * http://example.org/a/b.html;selector;truncate
 *
 * selector is the CSS selector where the main content is
 * truncate is a list of CSS selectors to strip off
 */
function figureOutTruncateAndSelector(sourceArgument) {
  // If we know exactly where the main content is, otherwise grab the whole
  // document body.
  const selector = (sourceArgument.selector.length === 0) ? 'body' : `${sourceArgument.selector}`;
  // Truncate is to strip off any patterns we do not want
  // as part of our archived article.
  let truncate = (sourceArgument.truncate.length === 0) ? '' : `${sourceArgument.truncate},`;
  truncate += 'script,style,noscript';
  return {selector, truncate};
}

async function extractLinks(recv, source) {
  const p = new Promise(resolve => resolve(cheerio.load(recv, {})));
  return p.then(shard => {
    const {selector, truncate} = figureOutTruncateAndSelector(source);
    shard(truncate).remove();
    shard(selector);
    const links = [];
    shard('a[href]').each((_, element) => {
      const href = shard(element).attr('href');
      try {
        const hrefObj = new URL(href);
        links.push(`${hrefObj.origin}${hrefObj.pathname}`);
      } catch (err) {}
    });
    return links;
  });
}

async function markdownify(recv, source) {
  const p = new Promise(resolve => resolve(cheerio.load(recv, {})));
  return p.then(shard => {
    const {selector, truncate} = figureOutTruncateAndSelector(source);
    const title = shard('title').text();
    shard(truncate).remove();
    const body = shard(selector).html();
    const frontMatter = {title};
    return {meta: frontMatter, body};
  })
  .then(simplified => {
    const metadata = [];
    for (const k in simplified.meta) {
      metadata.push(`${k}: "${simplified.meta[k]}"`);
    }
    const top = metadata.join(`\n`);
    const bottom = htmlmd(simplified.body);
    return `${top}\n\n----\n\n${bottom}\n`;
  });
}

async function reworkAssetReference(body, assets) {
  const p = new Promise(resolve => resolve(cheerio.load(body, cheerioConfig)));
  return p.then(shard => {
    /**
     * Each references dictionary should look like this;
     * ```
     * { 'http://example.org/a.png': '6c65613db26a19d838c0359989f941c303c04474.png',
     *   'http://example.org/a.webm': '5c737acd98c723bbed666bbfb3d14a8e0d34266b.webm' }
     * ```
     */
    const references = {};
    assets.forEach(ref => {
      references[ref.match] = ref.name;
    });
    return {references, shard};
  })
  .then(({references, shard}) => {
    shard('img[src]').each((_, element) => {
      /**
       * What we receive looks like this;
       * ```
       * { '_': 0,
       *   'element':
       *    { type: 'tag',
       *      name: 'img',
       *      attribs:
       *       { src: 'http://example.org/a.png',
       *         alt: 'A Image Alt text',
       *         class: 'example img class-name list' },
       *      children: [],
       *      next: null,
       *      prev: {},
       *      parent: {} } }
       * ```
       */
      shard(element).attr('class', null);
      const src = shard(element).attr('src');
      /**
       * Assuming our references object (see above) has a key
       * (e.g. http://example.org/a.png) with a matching
       * value (e.g. 6c65613db26a19d838c0359989f941c303c04474.png)
       * we replace the img[src] value with it.
       * That way, our Markdownified file will refer to archived
       * assets beside it instead of ones from source origin.
       */
      const newSrc = (typeof references[src] === 'string') ? references[src] : src + '?err=CouldNotFind';
      shard(element).attr('src', newSrc);
    });
    return shard.html();
  });
}

async function extractAssets(recv) {
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
      // or is in a blacklist?
      const isInlineImage = /;base64,/.test(potential);
      if (isInlineImage === false) {
        s.add(potential);
      }
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
 * source = { url: "http://renoirboulanger.com/page/3/"
 *               ,slug: 'renoirboulanger.com/page/3"}
 *
 * Running handleAssets(matches, source) gives us a cleaned up list of assets where is a good guess
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
 *     "src": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *     "match": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *     "dest": "renoirboulanger.com/page/3/430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg"
 *   },{
 *     "src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *     "match": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *     "dest": "renoirboulanger.com/page/3/b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png"
 *   },{
 *     "src": "http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *     "match": "//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *     "dest": "renoirboulanger.com/page/3/63dc122dfd3c702e12714fbe4ba744e463c49edb.img"
 *   },{
 *     "src": "http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *     "match": "/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *     "dest": "renoirboulanger.com/page/3/840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg"
 *   }]
 * }
 */
async function handleAssets(matches, source) {
  // console.log('handleAssets', [matches, source]); // DEBUG
  const p = new Promise(resolve => resolve(matches));
  return p.then(m => {
    const reduced = [];
    m.forEach(match => {
      const src = assetizer(source.url, match);
      const name = hasher(src);
      const dest = `${source.slug}/${name}`;
      reduced.push({src, match, dest, name});
    });
    return reduced;
  });
}

async function downloadAssets(assets) {
  console.log(`    assets:`);
  console.log(`      length: ${assets.length}`);
  if (assets.length > 0) {
    console.log(`      matches:`);
    for (const asset of assets) {
      // if (asset.src) is in blacklist #TODO
      const assetSrcOrigin = new URL(asset.src);
      if (domainsBlacklist.includes(assetSrcOrigin.hostname) === false) {
        await download(asset).catch(downloadError);
      }
    }
  }
  console.log(`\n`);
}

async function download({src, dest}) {
  const fileName = `archive/${dest}`; // Make parent folder configurable #TODO
  const fileExists = await fs.exists(fileName);
  console.log(`      - src: ${src}`);
  if (fileExists === false) {
    // Should we pass a User-Agent string? #TODO
    // ... and a Referrer. As if we downloaded it from a UA?
    const recv = await fetch(src);
    if (recv.ok === true) {
      console.log(`        dest: ${fileName}`);
      const dest = fs.createWriteStream(fileName);
      recv.body.pipe(dest);
      console.log(`        status: OK`);
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
  return {ok: false}; // Return Promise.reject({}) or not to? That is the question.
}

async function readCached(file) {
  const data = await fs.readFile(file, 'utf8');
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
  return Promise.reject({ok: false});
}

async function main(sourceList) {
  for (const source of sourceList) {
    console.log(`  ----`);
    const cachedFilePath = `archive/${source.slug}`; // Make parent folder configurable #TODO
    console.log(`  - source: ${source.url}`);
    console.log(`    path:   ${cachedFilePath}/`);
    const cachedFileName = `${cachedFilePath}/cache.html`;
    const cached = await readCached(cachedFileName).catch(readCachedError);
    const matches = await extractAssets(cached);
    const assets = await handleAssets(matches, source);
    const links = await extractLinks(cached, source);
    const cacheJsonRepresentation = {source, assets, links};
    // cacheJsonRepresentation.matches = matches; // DEBUG
    const cacheJsonFile = `${cachedFilePath}/cache.json`;
    if ((await fs.exists(cacheJsonFile)) === false) {
      await fs.writeTextFile(cacheJsonFile, JSON.stringify(cacheJsonRepresentation), 'utf8');
    }
    await downloadAssets(assets);
    // Hacky. For now. I'll fix this soon.
    const markdownifiedFile = `${cachedFilePath}/index.md`;
    if ((await fs.exists(markdownifiedFile)) === false) {
      console.log(`  ... markdownifying\n\n`);
      let markdownified = `url: ${source.url}\n`;
      // This is heavy. Let's not do it unless we really want.
      // Not sure we NEVER want to overwrite. Make this configurable?
      const reworked = await reworkAssetReference(cached, assets);
      markdownified += await markdownify(reworked, source);
      await fs.writeTextFile(markdownifiedFile, markdownified, 'utf8');
    } else {
      console.log(`  Already in Markdown!\n\n`);
    }
    // Not finished here #TODO
    // console.log(JSON.stringify(prep));
  }
}

async function transformer(list) {
  console.log(`Reading archive to gather image assets:`);
  await main(list);
  return Promise.all(list);
}

export default transformer;
