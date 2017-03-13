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

  let modifiedGiven = String(urlObj.href)
            .replace(/([a-z0-9_\-.:])$/i, '$1/');

  let file = String(asset)
            .replace(/^\.\//, '');

  /**
   * If file starts by /, we explicitly want
   * to start directly from the top of the
   * folder hirerarchy
   */
  if (/^\//.test(file)) {
    // console.log(`Start from top top most parent directory "${file}"`); // DEBUG
    modifiedGiven = String(`${urlObj.protocol}//${urlObj.hostname}`);
  }

  /**
   * How many times has the asset contains "../"
   * so we need to remove from
   */
  if (/\.\.\//.test(file)) {
    const goUp = file.match(/\.\.\//g);
    // console.log(`Has go up parent operator in path "${file}", found ${goUp.length} times`); // DEBUG
    const newGiven = modifiedGiven.split('/');
    for (let i = 0; i < (goUp.length + 1); i++) {
      newGiven.pop();
      // console.log(newGiven.join('/')); // DEBUG
    }
    modifiedGiven = newGiven.join('/');
    file = '/' + file.replace(/\.\.\//g, '');
  }

  return String(`${modifiedGiven}${file}`);
};
