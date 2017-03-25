'use strict';

import {URL} from 'url';

/**
 * Asset URL normalizer
 *
 * Given we have an article on http://example.org/foo/bar/baz.html
 * where an image is refered to as /image/a.jpg, we want to have
 * the image path be http://example.org/image/a.jpg.
 * But, if we have an image resource as image/b.jpg, we'd want
 * to be fetched as http://example.org/foo/bar/image/b.jpg.
 * Which mean we need to support path navigation.
 */
export default (given, asset) => {
  // console.log(`Given: ${given}, Asset: ${asset}`); // DEBUG
  let urlObj = {};

  try {
    urlObj = new URL(given);
  } catch (err) {
    throw new Error(given, err);
  }

  let targetGiven = String(urlObj.href)
        .replace(/([a-z0-9_\-.:])$/i, '$1/');

  let targetAsset = String(asset)
        .replace(/^\.\//, '');

  const givenIsTls = /^https:\/\//.test(urlObj.href);

  const assetHasFullUrl = /^https?:\/\//.test(asset);

  const assetHasFullUrlProtocolRelative = /^\/\//.test(asset);

  /**
   * If targetAsset starts by /, we explicitly want
   * to start directly from the top of the
   * folder hirerarchy
   */
  if (/^\//.test(targetAsset)) {
    // console.log(`Start from top top most parent directory "${targetAsset}"`); // DEBUG
    targetGiven = String(`${urlObj.protocol}//${urlObj.hostname}`);
  }

  /**
   * How many times has the asset contains "../"
   * so we need to remove from
   */
  if (/\.\.\//.test(targetAsset)) {
    const goUp = targetAsset.match(/\.\.\//g);
    // console.log(`Has go up parent operator in path "${targetAsset}", found ${goUp.length} times`); // DEBUG
    const newGiven = targetGiven.split('/');
    for (let i = 0; i < (goUp.length + 1); i++) {
      newGiven.pop();
      // console.log(newGiven.join('/')); // DEBUG
    }
    targetGiven = newGiven.join('/');
    targetAsset = '/' + targetAsset.replace(/\.\.\//g, '');
  }

  /**
   * If targetAsset starts by https?://, we ignore targetGiven
   */
  if (assetHasFullUrl === true) {
    targetGiven = '';
  }

  /**
   * If targetAsset starts by //, we ignore targetGiven
   */
  if (assetHasFullUrlProtocolRelative === true) {
    targetGiven = (givenIsTls === true) ? 'https:' : 'http:';
  }

  const ret = String(`${targetGiven}${targetAsset}`);
  // console.log('normalizer/assets', ret); // DEBUG

  return ret;
};
