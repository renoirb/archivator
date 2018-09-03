
import normalizeAssetName from './normalizer/hash';
import normalizeAssetReference from './normalizer/assets';

import {cheerioLoad, urlNotInBlacklist} from './common';

export class Asset {
  constructor(src) {
    this.src = src;
    this.name = normalizeAssetName(src);
  }

  clone() {
    return new Asset(this.src);
  }
}

/**
 * From an HTML payload, extract asset reference links as they are.
 *
 * Assets might be refered to using relative formats;
 * - //example.org/photo.jpg
 * - /photo.jpg
 * - photo.jpg
 *
 * We should receive at most, only one item per reference (no duplicates).
 *
 * Returns
 * ```
 * [ 'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
 *   '//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
 *   '/icones/logo_linkedin.png',
 *   '/wp-content/themes/renoirb/assets/img/852395.png',
 *   '/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
 *   '/wp-content/themes/renoirb/assets/img/shield_badge.png',
 *   'https://renoirboulanger.com/wp-content/uploads/2013/07/wplogo_transparent_lg.png'
 * ]
 * ```
 *
 * @param {String} body HTML payload of the given archivable document
 * @returns {String[]}
 */
async function extractAssets(body) {
  const cfg = {normalizeWhitespace: true, xmlMode: false, decodeEntities: true};
  return cheerioLoad(body, cfg).then(shard => {
    const collection = new Set();
    shard('img[src]').each((_, element) => {
      const potential = shard(element).attr('src');
      const isInlineImage = /;base64,/.test(potential);
      if (isInlineImage === false) {
        collection.add(potential);
      }
    });
    return [...collection];
  });
}

/**
 * Rework each asset so we can prepare to fetch
 *
 * Notice:
 * - Each item has a normalized name that's a hash from the normalized URL
 * - Gravatar sample started by //, and below, at src value, we'll have over http
 * - Gravatar sample did not have a file extension, that should be handled later
 * - zce_logo.jpb and logo_linkedin.png were refered to as relative to /, but below at src value, it's on renoirboulanger.com
 * - name has a file extension if there were one
 *
 * Most of that logic is handled by normalizeAssetReference.
 *
 * ```
 * [
 *   Asset {
 *     src: 'http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg',
 *     name: '430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg' },
 *   Asset {
 *     src: 'http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500',
 *     name: '63dc122dfd3c702e12714fbe4ba744e463c49edb' },
 *   Asset {
 *     src: 'http://renoirboulanger.com/icones/logo_linkedin.png',
 *     name: 'f6818e9afe9bcfc3c34f69f15165eefc6d54b8f9.png' },
 *   Asset {
 *     src: 'http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/852395.png',
 *     name: '7bfb84d694ca425f4c2a3acd0599f7e0b9e40872.png' },
 *   Asset {
 *     src: 'http://static.fsf.org/nosvn/associate/fsf-11005.png',
 *     name: '9b74eddb7fd5755b5c8ffc3cb00b128fec954d0f.png' },
 *   Asset {
 *     src: 'http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg',
 *     name: '840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg' },
 *   Asset {
 *     src: 'http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/shield_badge.png',
 *     name: '241a1eb401b54721b058f224babb593ab71db010.png' },
 *   Asset {
 *     src: 'https://renoirboulanger.com/wp-content/uploads/2013/07/wplogo_transparent_lg.png',
 *     name: 'c0e21ae7f0a56374116f08b44087d07ab8710035.png' }
 * ]
 * ```
 *
 * @param {Archivable} archivable From which we can get the originating URL, and HTML body contents
 * @returns {Asset[]} A collection of assets references
 */
export default async archivable => {
  const body = archivable.body;
  const archivableUrl = archivable.url;
  const extractedAssets = await extractAssets(body);
  const assets = [];
  for (const match of extractedAssets) {
    /**
     * Figure out a fully qualified link reference based out of
     * a potentially relative link.
     */
    const src = normalizeAssetReference(archivableUrl, match);
    if (urlNotInBlacklist(src)) {
      const asset = new Asset(src);
      assets.push(asset);
    }
  }
  return assets;
};
