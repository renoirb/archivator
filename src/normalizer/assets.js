'use strict';

import {URL} from 'url';

/**
 * Asset URL normalizer
 *
 * Given we have an article on http://example.org/foo/bar/baz.html
 * (refered to as "given") where an image tag contains /image/a.jpg
 * (refered to as "asset").
 * Typically an asset would be in an <img /> tag that would look like
 * this <img src="/a/b.jpg" />.
 * In this example, the image path would be http://example.org/a/b.jpg.
 * because the src attribute started by a slash.
 *
 * What would be the other valid values an img[src] contain?
 *
 * - /a/b.jpg
 * - a/b.jpg
 * - a/b
 * - ../a/b.jpg
 * - a/b.jpg?foo=bar
 * - //example.org/a/b.jpg
 * - http://elsewhere.org/a/b.jpg
 * - http://example.org/a/b.jpg
 * - https://example.org/a/b.jpg
 *
 * Each reference are relative to the path of document in
 * relation to the origin (e.g. http://example.org) and
 * the protocol (e.g. https:).
 *
 * ------------------------------------------------------
 *
 * Here are a few representation of an URL instance with
 * varying possible values.
 *
 * URL {
 *   href: 'http://example.org/a.html',
 *   origin: 'http://example.org',
 *   protocol: 'http:',
 *   username: '',
 *   password: '',
 *   host: 'example.org',
 *   hostname: 'example.org',
 *   port: '',
 *   pathname: '/a.html',
 *   search: '',
 *   searchParams: URLSearchParams {},
 *   hash: '' }
 *
 * Without an ending slash
 *
 * URL {
 *    href: 'http://example.org/a',
 *    ...
 *    pathname: '/a',
 *    ... }
 *
 * With an ending slash
 *
 *    URL {
 *      href: 'http://example.org/a/',
 *      ...
 *      pathname: '/a/',
 *      ... }
 *
 */
export default (given, asset) => {
  // console.log(`Given: ${given}, Asset: ${asset}`); // DEBUG
  let urlObj = {};

  try {
    urlObj = new URL(given);
    // console.log(urlObj); // DEBUG
  } catch (err) {
    throw new Error(given, err);
  }

  let targetGiven = String(urlObj.href)
        .replace(/([a-z0-9_\-.:])$/i, '$1/');

  let targetAsset = String(asset)
        .replace(/^\.\//, '');

  const hasFileExtensionRegEx = /\.(html?|do|action)/;

  const startWithHttpsRegEx = /^https:\/\//;

  const startWithHttpMaybeTlsRegEx = /^https?:\/\//;

  const startWithDoublySlashRegEx = /^\/\//;

  const startWithOneSlashRegEx = /^\/(?!\/)/;

  const endWithOneSlashRegEx = /\/(?!\/)$/;

  /**
   * File with an extension (e.g. /index.html, /action.do)
   * should not be treated as folders.
   */
  if (hasFileExtensionRegEx.test(urlObj.pathname) === true) {
    targetGiven = String(`${urlObj.origin}/`);
    if (startWithOneSlashRegEx.test(asset) === false) {
      // If asset DOES NOT start with a slash (e.g. <img src="a.png" />)
      // An array out of the URL, without empty members
      // e.g. '/a/c.html' => [ '', 'a', 'c.html' ]
      // With this below, it becomes [ '', 'a', 'c.html' ]
      const targetAssetPathnameArray = urlObj.pathname.split('/').filter(n => n);
      targetAssetPathnameArray.pop(); // Strip off file and extension member
      targetGiven += targetAssetPathnameArray.join('/');
      if (endWithOneSlashRegEx.test(targetGiven) === false) {
        targetGiven += '/';
      }
    }
    // Make sure targetGiven ENDS with slash. http://example.org/a/
  }

  /**
   * If targetAsset starts by /, we explicitly want
   * to start directly from the top of the
   * folder hirerarchy
   * e.g. /a.png
   */
  if (startWithOneSlashRegEx.test(targetAsset)) {
    // console.log(`Start from top top most parent directory "${targetAsset}"`); // DEBUG
    targetGiven = String(`${urlObj.protocol}//${urlObj.hostname}/`);
    targetAsset = targetAsset.replace(startWithOneSlashRegEx, '');
    // Make sure if we had a / at the asset, it's stripped off uniformally
    // {asset: '/a.png', targetGiven: 'http://example.org/', targetAsset: 'a.png'}
  }

  /**
   * How many times has the asset contains "../"
   * and let's handle how deep we can go to a parent directory.
   *
   * Here are a few possible edge cases.
   *
   * ```
   * ----
   * Equal number directory deep and request for going up.
   * [ { given: 'http://example.org/ignored/also_ignored/and_too',
   *     targetGiven: 'http://example.org/ignored/also_ignored/and_too/' },
   *   { asset: '../../../a.jpg', targetAsset: '../../../a.jpg' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 3,
   *     goUp: 3,
   *     targetAssetArray: [ 'a.jpg' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   *
   * ----
   * [ { given: 'http://example.org/ignored/also_ignored/',
   *     targetGiven: 'http://example.org/ignored/also_ignored/' },
   *   { asset: '../../a.jpg', targetAsset: '../../a.jpg' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 2,
   *     goUp: 2,
   *     targetAssetArray: [ 'a.jpg' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   *
   * ----
   * File has extension, we cannot treat it as a directory.
   * [ { given: 'http://example.org/b/c.html',
   *     targetGiven: 'http://example.org/b/' },
   *   { asset: '../a.png', targetAsset: '../a.png' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 1,
   *     goUp: 1,
   *     targetAssetArray: [ 'a.png' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   *
   * ----
   * Here, we are asking to go beyond one directory deep.
   * Notice isTargetAssetGoUpOverflow is true.
   * [ { given: 'http://example.org/b/c.html',
   *     targetGiven: 'http://example.org/' },
   *   { asset: '../../../../../a.png', targetAsset: 'a.png' },
   *   { isTargetAssetGoUpOverflow: true,
   *     targetGivenPathname: 1,
   *     goUp: 5,
   *     targetAssetArray: [ 'a.png' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   * ```
   */
  if (/\.\.\//.test(targetAsset)) {
    const goUp = targetAsset.match(/\.\.\//g);
    // console.log(`Has go up parent operator in path "${targetAsset}", found ${goUp.length} times`); // DEBUG
    const tempTargetGivenUrlObj = new URL(targetGiven);
    const targetGivenPathname = tempTargetGivenUrlObj.pathname.split('/').filter(n => n);
    const isTargetAssetGoUpOverflow = targetGivenPathname.length < goUp.length;
    let sliceUntilHowMany = targetGivenPathname.length - goUp.length;

    // Make sure this edge-case is taken into account so that we can still
    // calculate how deep we go without overriding.
    // Maybe that's a mutually exclusive scenario and we need to else from here.
    if (isTargetAssetGoUpOverflow === true) {
      // Assuming we have impossible to reach, we got to stop at the origin:
      // targetGiven = http://example.org/
      // targetAsset = ../../bogus.png
      // Force so we serve at the top http://example.org/bogus.png
      sliceUntilHowMany = 0;
    }

    const newTargetGivenPathname = targetGivenPathname.slice(0, sliceUntilHowMany);
    const targetAssetArray = newTargetGivenPathname.concat(targetAsset.split('/').filter(n => n !== '..'));
    // console.log([{given, targetGiven}, {asset, targetAsset}, {isTargetAssetGoUpOverflow, targetGivenPathname: targetGivenPathname.length, goUp: goUp.length, targetAssetArray, newTargetGivenPathname, sliceUntilHowMany}]);
    targetGiven = String(`${urlObj.origin}/`);
    targetAsset = String(`${targetAssetArray.join('/')}`);
  }

  /**
   * If targetAsset starts by https?://, we ignore targetGiven
   */
  if (startWithHttpMaybeTlsRegEx.test(asset) === true) {
    targetGiven = '';
  }

  /**
   * If targetAsset starts by //, we ignore targetGiven
   */
  if (startWithDoublySlashRegEx.test(asset) === true) {
    targetGiven = (startWithHttpsRegEx.test(urlObj.href) === true) ? 'https:' : 'http:';
  }

  const ret = String(`${targetGiven}${targetAsset}`);
  // console.log('normalizer/assets', ret); // DEBUG

  return ret;
};
