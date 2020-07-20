import { toUrl } from 'url-dirname-normalizer'

/**
 * Normalize Asset Reference.
 *
 * Given we have an article URL at http://example.org/foo/bar/baz.html
 * (a.k.a. "sourceDocument") where we can have many image tags we want
 * to keep a copy (e.g. <img src="/image/a.jpg" />, refered here as "asset").
 * We want to know where should we download /image/a.jpg from.
 * To do this, we can figure out by combining the sourceDocument and the asset
 *
 * For a given sourceDocument URL with 0 or more assets in document's HTML,
 * we want to get output as:
 * [ http://example.org/image/a.jpg,
 *   ... ]
 *
 * This module should handle all valid asset paths and return
 * a fully qualified URL so we can download the asset.
 *
 * For example, the URL of a sourceDocument could be "http://example.org/foo/bar.html"
 * with images ("asset" img tags with src="...") img[src] values;
 *
 * - /a/b.jpg                      => http://example.org/a/b.jpg
 * - a/b.jpg                       => http://example.org/foo/a/b.jpg
 * - a/b                           => http://example.org/foo/a/b
 * - ../a/b.jpg                    => http://example.org/a/b.jpg
 * - a/b.jpg?foo=bar               => http://example.org/foo/a/b.jpg?foo=bar
 * - //example.org/a/b.jpg         => http://example.org/a/b.jpg
 * - http://elsewhere.org/a/b.jpg  => http://elsewhere.org/a/b.jpg
 * - https://example.org/a/b.jpg   => https://example.org/a/b.jpg
 *
 * @param sourceDocument {string} — URL to the document where the asset is found in
 * @param asset {string} — URL or relative URL path or protocol-less URL reference to asset, typically found in a link,img,... HTML tag
 *
 * @author Renoir Boulanger <contribs@renoirboulanger.com>
 */
export const assetUrlNormalizer = (
  sourceDocument: string,
  asset: string,
): string => {
  const sourceDocumentUrl = toUrl(sourceDocument)
  // console.log(`Given: ${sourceDocument}, Asset: ${asset}`); // DEBUG

  let targetGiven = String(sourceDocumentUrl.href).replace(
    /([a-z0-9_\-.:])$/i,
    '$1/',
  )

  let targetAsset = String(asset).replace(/^\.\//, '')

  const hasFileExtensionRegEx = /\.(html?|do|action)/

  const startWithHttpsRegEx = /^https:\/\//

  const startWithHttpMaybeTlsRegEx = /^https?:\/\//

  const startWithDoublySlashRegEx = /^\/\//

  const startWithOneSlashRegEx = /^\/(?!\/)/

  const endWithOneSlashRegEx = /\/(?!\/)$/

  /**
   * File with an extension (e.g. /index.html, /action.do)
   * should not be treated as folders.
   */
  if (hasFileExtensionRegEx.test(sourceDocumentUrl.pathname) === true) {
    targetGiven = String(`${sourceDocumentUrl.origin}/`)
    if (startWithOneSlashRegEx.test(asset) === false) {
      // If asset DOES NOT start with a slash (e.g. <img src="a.png" />)
      // An array out of the URL, without empty members
      // e.g. '/a/c.html' => [ '', 'a', 'c.html' ]
      const targetAssetPathnameArray = sourceDocumentUrl.pathname
        .split('/')
        .filter((n) => n)
      targetAssetPathnameArray.pop() // Strip off file and extension member
      targetGiven += targetAssetPathnameArray.join('/')
      if (endWithOneSlashRegEx.test(targetGiven) === false) {
        targetGiven += '/'
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
    targetGiven = String(
      `${sourceDocumentUrl.protocol}//${sourceDocumentUrl.hostname}/`,
    )
    targetAsset = targetAsset.replace(startWithOneSlashRegEx, '')
    // Make sure if we had a / at the asset, it's stripped off uniformally
    // {asset: '/a.png', targetGiven: 'http://example.org/', targetAsset: 'a.png'}
  }

  /**
   * How many times has the asset contains "../"
   * and let's handle how deep we can go to a parent directory.
   *
   * Here are a few possible edge cases.
   *
   * ----
   *
   * Equal number directory deep and request for going up.
   *
   * ```
   * [ { sourceDocument: 'http://example.org/ignored/also_ignored/and_too',
   *     targetGiven: 'http://example.org/ignored/also_ignored/and_too/' },
   *   { asset: '../../../a.jpg', targetAsset: '../../../a.jpg' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 3,
   *     goUp: 3,
   *     targetAssetArray: [ 'a.jpg' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   *
   * [ { sourceDocument: 'http://example.org/ignored/also_ignored/',
   *     targetGiven: 'http://example.org/ignored/also_ignored/' },
   *   { asset: '../../a.jpg', targetAsset: '../../a.jpg' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 2,
   *     goUp: 2,
   *     targetAssetArray: [ 'a.jpg' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   * ```
   *
   * ----
   *
   * File has extension, we cannot treat it as a directory.
   *
   * ```
   * [ { sourceDocument: 'http://example.org/b/c.html',
   *     targetGiven: 'http://example.org/b/' },
   *   { asset: '../a.png', targetAsset: '../a.png' },
   *   { isTargetAssetGoUpOverflow: false,
   *     targetGivenPathname: 1,
   *     goUp: 1,
   *     targetAssetArray: [ 'a.png' ],
   *     newTargetGivenPathname: [],
   *     sliceUntilHowMany: 0 } ]
   * ```
   *
   * ----
   *
   * Here, we are asking to go beyond one directory deep.
   * Notice isTargetAssetGoUpOverflow is true.
   *
   * ```
   * [ { sourceDocument: 'http://example.org/b/c.html',
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
    const goUp = targetAsset.match(/\.\.\//g)
    // console.log(`Has go up parent operator in path "${targetAsset}", found ${goUp.length} times`); // DEBUG
    const tempTargetGivenUrlObj = toUrl(targetGiven)
    const targetGivenPathname = tempTargetGivenUrlObj.pathname
      .split('/')
      .filter((n) => n)
    const isTargetAssetGoUpOverflow =
      Array.isArray(goUp) && targetGivenPathname.length < goUp.length
    let sliceUntilHowMany = Array.isArray(goUp)
      ? targetGivenPathname.length - goUp.length
      : 0

    // Make sure this edge-case is taken into account so that we can still
    // calculate how deep we go without overriding.
    // Maybe that's a mutually exclusive scenario and we need to else from here.
    if (isTargetAssetGoUpOverflow === true) {
      // Assuming we have impossible to reach, we got to stop at the origin:
      // targetGiven = http://example.org/
      // targetAsset = ../../bogus.png
      // Force so we serve at the top http://example.org/bogus.png
      sliceUntilHowMany = 0
    }

    const newTargetGivenPathname = targetGivenPathname.slice(
      0,
      sliceUntilHowMany,
    )
    const targetAssetArray = newTargetGivenPathname.concat(
      targetAsset.split('/').filter((n) => n !== '..'),
    )
    // console.log([
    //   { sourceDocument, targetGiven },
    //   { asset, targetAsset },
    //   {
    //     isTargetAssetGoUpOverflow,
    //     targetGivenPathname: targetGivenPathname.length,
    //     // goUp: goUp.length,
    //     targetAssetArray,
    //     newTargetGivenPathname,
    //     sliceUntilHowMany,
    //   },
    // ])
    targetGiven = String(`${sourceDocumentUrl.origin}/`)
    targetAsset = String(`${targetAssetArray.join('/')}`)
  }

  /**
   * If targetAsset starts by https?://, we ignore targetGiven
   */
  if (startWithHttpMaybeTlsRegEx.test(asset) === true) {
    targetGiven = ''
  }

  /**
   * If targetAsset starts by //, we ignore targetGiven
   */
  if (startWithDoublySlashRegEx.test(asset) === true) {
    targetGiven =
      startWithHttpsRegEx.test(sourceDocumentUrl.href) === true
        ? 'https:'
        : 'http:'
  }

  const newUrlString = String(`${targetGiven}${targetAsset}`)
  const url = toUrl(newUrlString)
  // console.log('normalizer/assets', { newUrlString, url }); // DEBUG

  return String(url)
}
