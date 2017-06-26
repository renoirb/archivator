import crypto from 'crypto';
import {URL} from 'url';

/**
 * File name hasher
 *
 * For any given Rewrite a file name based on an URL they were downloaded from
 */

export default resourceUrl => {
  /**
   * const hashes = crypto.getHashes();
   * Yields available hashes
   * ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
   *
   * See also list of message digests with locally installed OpenSSL/LibreSSL
   * #TODO
   *
   * SHA1 should be enough, we do not want a too long file name.
   * Ideally it would be something very short but with high entropy
   * with elliptic curve type of hashes.
   * Or maybe we could just truncate the string.
   * Food for thoughts. #TODO
   */
  const hash = crypto.createHash('sha1');
  let urlObj = {};
  try {
    urlObj = new URL(resourceUrl);
  } catch (err) {
    throw new Error(resourceUrl, err);
  }

  const pathname = urlObj.pathname;
  // svg, png, jpg, webm
  let extension = pathname.match(/(\.[a-z]{2,})$/i);
  if (extension === null) {
    /**
     * We want an extension, but maybe we should support loading the resource via HTTP
     * and grab mime-type and figure out what extension.
     * Let's not mingle file extensions at all.
     */
    extension = '';
  } else {
    extension = extension[0];
  }
  // console.log('normalizer/hash', resourceUrl, extension); // DEBUG
  const ret = hash.update(resourceUrl).digest('hex') + extension.toLowerCase();

  // console.log('normalizer/hash', ret); // DEBUG
  return ret;
};
